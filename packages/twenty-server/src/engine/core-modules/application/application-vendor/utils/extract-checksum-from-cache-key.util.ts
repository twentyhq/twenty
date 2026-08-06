export const extractChecksumFromCacheKey = (
  cacheKey: string | undefined,
): string | undefined => cacheKey?.replace(/\.js$/, '');
