import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { getFingerprintedRestUrl } from '@/front-components/utils/getFingerprintedRestUrl';

describe('getFingerprintedRestUrl', () => {
  it('builds a checksum-fingerprinted path URL when a checksum is provided', () => {
    expect(
      getFingerprintedRestUrl({
        resource: 'front-components',
        id: 'front-component-id',
        checksum: 'abc123',
      }),
    ).toBe(
      `${REST_API_BASE_URL}/front-components/front-component-id/abc123.js`,
    );
  });

  it('falls back to the bare id URL when no checksum is provided', () => {
    expect(
      getFingerprintedRestUrl({
        resource: 'application-vendor',
        id: 'application-id',
      }),
    ).toBe(`${REST_API_BASE_URL}/application-vendor/application-id`);
  });
});
