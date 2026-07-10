import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { getSdkClientUrls } from '@/front-components/utils/getSdkClientUrls';

describe('getSdkClientUrls', () => {
  it('builds application-scoped core and metadata sdk client urls', () => {
    expect(getSdkClientUrls('application-id')).toEqual({
      core: `${REST_API_BASE_URL}/sdk-client/application-id/core`,
      metadata: `${REST_API_BASE_URL}/sdk-client/application-id/metadata`,
    });
  });
});
