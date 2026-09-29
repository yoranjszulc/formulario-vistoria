const CACHE = "vistoria-v6-21";
const ARQUIVOS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(
    ks.filter(k => k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
// navegaÃ§Ã£o: tenta rede (pega atualizaÃ§Ã£o), cai no cache (offline na planta)
self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request).then(r => {
      // erro do proprio site (404/5xx, repositorio fora do ar) nao e pagina: nao troca a
      // copia boa do cache e cai no offline (29/09/2026). Resposta da nuvem passa como veio.
      if (!r.ok && new URL(e.request.url).origin === location.origin) throw new Error("HTTP " + r.status);
      const cp = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, cp));
      return r;
    }).catch(() => caches.match(e.request, {ignoreSearch: true})
        .then(r => r || caches.match("./index.html")))
  );
});
