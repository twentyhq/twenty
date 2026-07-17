import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { getSdkClientUrls } from '@/front-components/utils/getSdkClientUrls';

describe('getSdkClientUrls', () => {
  it('builds application-scoped core and metadata sdk client urls', () => {
    expect(getSdkClientUrls('application-id')).toEqual({
      core: `${REST_API_BASE_URL}/sdk-client/application-id/core`,
      metadata: `${REST_API_BASE_URL}/sdk-client/application-id/metadata`,
    });
  });

  it('builds content-addressed urls when checksums are provided', () => {
    expect(
      getSdkClientUrls('application-id', {
        core: 'core-checksum',
        metadata: 'metadata-checksum',
      }),
    ).toEqual({
      core: `${REST_API_BASE_URL}/sdk-client/application-id/core/core-checksum.js`,
      metadata: `${REST_API_BASE_URL}/sdk-client/application-id/metadata/metadata-checksum.js`,
    });
  });
});
