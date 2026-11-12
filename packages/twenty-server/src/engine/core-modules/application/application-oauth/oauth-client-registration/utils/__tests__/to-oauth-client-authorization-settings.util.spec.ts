import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { toOAuthClientAuthorizationSettings } from 'src/engine/core-modules/application/application-oauth/oauth-client-registration/utils/to-oauth-client-authorization-settings.util';

const CLIENT_ID_METADATA_DOCUMENT = {
  clientId: 'https://client.example.com/oauth/client.json',
  clientName: 'Example',
  logoUri: null,
  redirectUris: ['https://client.example.com/callback'],
};

describe('toOAuthClientAuthorizationSettings', () => {
  it('should describe a document client that has no registration yet as a public client with every scope', () => {
    expect(
      toOAuthClientAuthorizationSettings({
        kind: 'clientIdMetadataDocument',
        registration: null,
        clientIdMetadataDocument: CLIENT_ID_METADATA_DOCUMENT,
      }),
    ).toEqual({
      oAuthClientId: 'https://client.example.com/oauth/client.json',
      oAuthClientSecretHash: null,
      oAuthRedirectUris: ['https://client.example.com/callback'],
      oAuthScopes: [...ALL_OAUTH_SCOPES],
    });
  });
});
