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

  it('returns no-store when the requested checksum differs', () => {
    expect(
      getSharedDependenciesBundleCacheControl({
        requestedChecksum: 'b'.repeat(64),
        sharedDependenciesChecksum: CHECKSUM,
      }),
    ).toBe(PRESIGNED_URL_NO_STORE_CACHE_CONTROL);
  });

  it('returns no-store when no checksum was requested', () => {
    expect(
      getSharedDependenciesBundleCacheControl({
        requestedChecksum: undefined,
        sharedDependenciesChecksum: CHECKSUM,
      }),
    ).toBe(PRESIGNED_URL_NO_STORE_CACHE_CONTROL);
  });

  it('returns no-store when the application has no shared dependencies checksum', () => {
    expect(
      getSharedDependenciesBundleCacheControl({
        requestedChecksum: CHECKSUM,
        sharedDependenciesChecksum: null,
      }),
    ).toBe(PRESIGNED_URL_NO_STORE_CACHE_CONTROL);
  });
});
