import { extractChecksumFromCacheKey } from 'src/engine/core-modules/application/application-vendor/utils/extract-checksum-from-cache-key.util';

const VALID_CHECKSUM = 'a'.repeat(64);

describe('extractChecksumFromCacheKey', () => {
  it('extracts the checksum from a fingerprinted cache key', () => {
    expect(extractChecksumFromCacheKey(`${VALID_CHECKSUM}.js`)).toBe(
      VALID_CHECKSUM,
    );
  });

  it('returns undefined when no cache key is provided', () => {
    expect(extractChecksumFromCacheKey(undefined)).toBeUndefined();
  });

  it.each([
    ['missing extension', VALID_CHECKSUM],
    ['wrong extension', `${VALID_CHECKSUM}.css`],
    ['too short', `${'a'.repeat(63)}.js`],
    ['non-hex characters', `${'z'.repeat(64)}.js`],
    ['uppercase hex', `${'A'.repeat(64)}.js`],
    ['path traversal', `../${VALID_CHECKSUM}.js`],
  ])('returns undefined for a malformed cache key (%s)', (_label, cacheKey) => {
    expect(extractChecksumFromCacheKey(cacheKey)).toBeUndefined();
  });
});
