import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { getApplicationVendorUrl } from '@/front-components/utils/getApplicationVendorUrl';

describe('getApplicationVendorUrl', () => {
  it('builds a checksum-fingerprinted path URL when a checksum is provided', () => {
    expect(
      getApplicationVendorUrl({
        applicationId: 'application-id',
        checksum: 'abc123',
      }),
    ).toBe(`${REST_API_BASE_URL}/application-vendor/application-id/abc123.js`);
  });

  it('falls back to the bare id URL when no checksum is provided', () => {
    expect(getApplicationVendorUrl({ applicationId: 'application-id' })).toBe(
      `${REST_API_BASE_URL}/application-vendor/application-id`,
    );
  });
});
