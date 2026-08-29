import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { getSdkClientUrls } from '@/front-components/utils/getSdkClientUrls';

describe('getSdkClientUrls', () => {
  it('builds bare urls when checksums are absent', () => {
    expect(getSdkClientUrls('application-id')).toEqual({
      core: `${REST_API_BASE_URL}/sdk-client/application-id/core`,
      metadata: `${REST_API_BASE_URL}/sdk-client/metadata`,
    });
  });

  it('builds content-addressed urls when checksums are provided', () => {
    expect(
      getSdkClientUrls('application-id', {
        core: 'core-checksum',
        metadata: 'metadata-checksum',
      }),
    ).toEqual({
      core: `${REST_API_BASE_URL}/sdk-client/application-id/core/core-checksum`,
      metadata: `${REST_API_BASE_URL}/sdk-client/metadata/metadata-checksum`,
    });
  });

  it('falls back to the bare core url when only the metadata checksum is available', () => {
    expect(
      getSdkClientUrls('application-id', {
        core: null,
        metadata: 'metadata-checksum',
      }),
    ).toEqual({
      core: `${REST_API_BASE_URL}/sdk-client/application-id/core`,
      metadata: `${REST_API_BASE_URL}/sdk-client/metadata/metadata-checksum`,
    });
  });
});
