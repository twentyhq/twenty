const MAX_FIND_ALL_VIEWS_CACHE_TTL_MS = 60 * 60 * 1000;

export const getFindAllViewsCacheTtl = (
  cacheStorageTtlMilliseconds: number,
): number =>
  cacheStorageTtlMilliseconds > 0
    ? Math.min(MAX_FIND_ALL_VIEWS_CACHE_TTL_MS, cacheStorageTtlMilliseconds)
    : MAX_FIND_ALL_VIEWS_CACHE_TTL_MS;
