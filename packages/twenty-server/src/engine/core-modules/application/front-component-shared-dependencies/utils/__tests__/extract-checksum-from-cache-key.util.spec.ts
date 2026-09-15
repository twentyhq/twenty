import { extractChecksumFromCacheKey } from 'src/engine/core-modules/application/front-component-shared-dependencies/utils/extract-checksum-from-cache-key.util';

const VALID_CHECKSUM = 'a'.repeat(64);

describe('extractChecksumFromCacheKey', () => {
  it('extracts the checksum from a fingerprinted cache key', () => {
    expect(extractChecksumFromCacheKey(`${VALID_CHECKSUM}.js`)).toBe(
      VALID_CHECKSUM,
    );
  });

  it.each([
    ['no cache key', undefined],
    ['a non-checksum segment', `${'z'.repeat(64)}.js`],
    ['a path traversal', `../${VALID_CHECKSUM}.js`],
  ])('fails closed on %s', (_label, cacheKey) => {
    expect(extractChecksumFromCacheKey(cacheKey)).toBeUndefined();
  });
});
