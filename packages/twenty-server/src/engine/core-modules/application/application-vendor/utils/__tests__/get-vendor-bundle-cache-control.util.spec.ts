import { getVendorBundleCacheControl } from 'src/engine/core-modules/application/application-vendor/utils/get-vendor-bundle-cache-control.util';
import {
  IMMUTABLE_FILE_CACHE_CONTROL,
  PRESIGNED_URL_NO_STORE_CACHE_CONTROL,
} from 'src/engine/core-modules/file/interfaces/file-folder.interface';

const CHECKSUM = 'a'.repeat(64);

describe('getVendorBundleCacheControl', () => {
  it('returns the immutable cache control when the requested checksum matches', () => {
    expect(
      getVendorBundleCacheControl({
        requestedChecksum: CHECKSUM,
        vendorChecksum: CHECKSUM,
      }),
    ).toBe(IMMUTABLE_FILE_CACHE_CONTROL);
  });

  it('returns no-store when the requested checksum differs', () => {
    expect(
      getVendorBundleCacheControl({
        requestedChecksum: 'b'.repeat(64),
        vendorChecksum: CHECKSUM,
      }),
    ).toBe(PRESIGNED_URL_NO_STORE_CACHE_CONTROL);
  });

  it('returns no-store when no checksum was requested', () => {
    expect(
      getVendorBundleCacheControl({
        requestedChecksum: undefined,
        vendorChecksum: CHECKSUM,
      }),
    ).toBe(PRESIGNED_URL_NO_STORE_CACHE_CONTROL);
  });

  it('returns no-store when the application has no vendor checksum', () => {
    expect(
      getVendorBundleCacheControl({
        requestedChecksum: CHECKSUM,
        vendorChecksum: null,
      }),
    ).toBe(PRESIGNED_URL_NO_STORE_CACHE_CONTROL);
  });
});
