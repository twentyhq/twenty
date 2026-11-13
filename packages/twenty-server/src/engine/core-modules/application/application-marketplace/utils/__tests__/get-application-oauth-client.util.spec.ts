import { getApplicationOAuthClient } from 'src/engine/core-modules/application/application-marketplace/utils/get-application-oauth-client.util';

const OAUTH_CLIENT = {
  clientIdMetadataDocumentUrls: [
    'https://client.example.com/oauth/client.json',
  ],
  connectUrl: 'https://client.example.com/connect?server={mcpServerUrl}',
};

describe('getApplicationOAuthClient', () => {
  it('should return the OAuth client a manifest declares', () => {
    expect(
      getApplicationOAuthClient({ application: { oAuthClient: OAUTH_CLIENT } }),
    ).toEqual(OAUTH_CLIENT);
  });

  it('should return nothing for a manifest without an OAuth client', () => {
    expect(getApplicationOAuthClient({ application: {} })).toBeUndefined();
    expect(getApplicationOAuthClient(null)).toBeUndefined();
  });

  it('should ignore a malformed OAuth client without throwing', () => {
    expect(
      getApplicationOAuthClient(
        JSON.parse(
          '{"application":{"oAuthClient":{"clientIdMetadataDocumentUrls":[{"toString":null}],"connectUrl":"https://client.example.com/connect"}}}',
        ),
      ),
    ).toBeUndefined();
  });

  it('should ignore an OAuth client whose connect URL is not https', () => {
    expect(
      getApplicationOAuthClient({
        application: {
          oAuthClient: { ...OAUTH_CLIENT, connectUrl: 'javascript:alert(1)' },
        },
      }),
    ).toBeUndefined();
  });
});
