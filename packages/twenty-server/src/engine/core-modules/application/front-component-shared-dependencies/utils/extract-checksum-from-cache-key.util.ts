const SHARED_DEPENDENCIES_CACHE_KEY_PATTERN = /^([0-9a-f]{64})(?:\.js)?$/;

export const extractChecksumFromCacheKey = (
  cacheKey: string | undefined,
): string | undefined => {
  const [, checksum] =
    cacheKey?.match(SHARED_DEPENDENCIES_CACHE_KEY_PATTERN) ?? [];

  return checksum;
};
