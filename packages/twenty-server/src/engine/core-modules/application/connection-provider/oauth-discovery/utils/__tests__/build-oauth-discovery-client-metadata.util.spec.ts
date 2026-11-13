import { TWENTY_CURRENT_VERSION } from 'src/engine/core-modules/upgrade/constants/twenty-current-version.constant';
import { buildOAuthDiscoveryClientMetadata } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/build-oauth-discovery-client-metadata.util';

describe('buildOAuthDiscoveryClientMetadata', () => {
  it('identifies the instance to the authorization server', () => {
    expect(
      buildOAuthDiscoveryClientMetadata({
        serverUrl: 'https://api.crm.example.com',
        frontendUrl: 'https://crm.example.com/',
      }),
    ).toMatchObject({
      client_name: 'Twenty',
      logo_uri: 'https://crm.example.com/images/icons/ios/192.png',
      software_id: 'twenty',
      software_version: TWENTY_CURRENT_VERSION,
      redirect_uris: ['https://api.crm.example.com/auth/apps/callback'],
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
    });
  });
});
