import { getSharedDependenciesBundleCacheControl } from 'src/engine/core-modules/application/front-component-shared-dependencies/utils/get-shared-dependencies-bundle-cache-control.util';
import {
  IMMUTABLE_FILE_CACHE_CONTROL,
  PRESIGNED_URL_NO_STORE_CACHE_CONTROL,
} from 'src/engine/core-modules/file/interfaces/file-folder.interface';

const CHECKSUM = 'a'.repeat(64);

describe('getSharedDependenciesBundleCacheControl', () => {
  it('returns the immutable cache control when the requested checksum matches', () => {
    expect(
      getSharedDependenciesBundleCacheControl({
        requestedChecksum: CHECKSUM,
        sharedDependenciesChecksum: CHECKSUM,
      }),
    ).toBe(IMMUTABLE_FILE_CACHE_CONTROL);
  });

  it.each([
    ['the requested checksum differs', 'b'.repeat(64), CHECKSUM],
    ['no checksum was requested', undefined, CHECKSUM],
    ['the application has no checksum', CHECKSUM, null],
  ])(
    'returns no-store when %s',
    (_label, requestedChecksum, storedChecksum) => {
      expect(
        getSharedDependenciesBundleCacheControl({
          requestedChecksum,
          sharedDependenciesChecksum: storedChecksum,
        }),
      ).toBe(PRESIGNED_URL_NO_STORE_CACHE_CONTROL);
    },
  );
});
