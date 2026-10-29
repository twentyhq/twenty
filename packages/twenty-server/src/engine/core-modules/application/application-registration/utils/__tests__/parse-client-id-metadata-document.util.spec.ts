import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { parseClientIdMetadataDocument } from 'src/engine/core-modules/application/application-registration/utils/parse-client-id-metadata-document.util';

const CLIENT_ID = 'https://app.example.com/oauth/client.json';

describe('parseClientIdMetadataDocument', () => {
  it('should parse a valid document', () => {
    expect(
      parseClientIdMetadataDocument({
        clientId: CLIENT_ID,
        document: {
          client_id: CLIENT_ID,
          client_name: 'Example',
          redirect_uris: ['https://app.example.com/callback'],
          logo_uri: 'https://app.example.com/logo.png',
          token_endpoint_auth_method: 'none',
        },
      }),
    ).toEqual({
      valid: true,
      metadata: {
        name: 'Example',
        redirectUris: ['https://app.example.com/callback'],
        scopes: [...ALL_OAUTH_SCOPES],
        logoUri: 'https://app.example.com/logo.png',
        clientUri: null,
      },
    });
  });

  it('should fall back to the host when client_name is missing', () => {
    const result = parseClientIdMetadataDocument({
      clientId: CLIENT_ID,
      document: {
        client_id: CLIENT_ID,
        redirect_uris: ['https://app.example.com/callback'],
      },
    });

    expect(result.valid && result.metadata.name).toBe('app.example.com');
  });

  it.each([
    ['a non-object document', ['not', 'an', 'object']],
    [
      'a mismatching client_id',
      {
        client_id: 'https://evil.example.com/client.json',
        redirect_uris: ['https://app.example.com/callback'],
      },
    ],
    [
      'a client secret',
      {
        client_id: CLIENT_ID,
        client_secret: 'secret',
        redirect_uris: ['https://app.example.com/callback'],
      },
    ],
    [
      'a confidential auth method',
      {
        client_id: CLIENT_ID,
        token_endpoint_auth_method: 'client_secret_basic',
        redirect_uris: ['https://app.example.com/callback'],
      },
    ],
    ['missing redirect_uris', { client_id: CLIENT_ID }],
    [
      'an insecure redirect_uri',
      { client_id: CLIENT_ID, redirect_uris: ['http://app.example.com/cb'] },
    ],
  ])('should reject %s', (_, document) => {
    expect(
      parseClientIdMetadataDocument({ clientId: CLIENT_ID, document }).valid,
    ).toBe(false);
  });
});
