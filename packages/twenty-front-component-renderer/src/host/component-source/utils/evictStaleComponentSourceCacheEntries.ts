export const evictStaleComponentSourceCacheEntries = ({
  cache,
  url,
}: {
  cache: Cache;
  url: string;
}): void => {
  const componentUrlPrefix = url.slice(0, url.lastIndexOf('/') + 1);

  cache
    .keys()
    .then((cachedRequests) => {
      const staleRequests = cachedRequests.filter(
        (cachedRequest) =>
          cachedRequest.url !== url &&
          cachedRequest.url.startsWith(componentUrlPrefix),
      );

      for (const staleRequest of staleRequests) {
        cache.delete(staleRequest).catch(() => undefined);
      }
    })
    .catch(() => undefined);
};
