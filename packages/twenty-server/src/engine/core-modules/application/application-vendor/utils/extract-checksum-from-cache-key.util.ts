const VENDOR_CACHE_KEY_PATTERN = /^([0-9a-f]{64})\.js$/;

export const extractChecksumFromCacheKey = (
  cacheKey: string | undefined,
): string | undefined => cacheKey?.match(VENDOR_CACHE_KEY_PATTERN)?.[1];
