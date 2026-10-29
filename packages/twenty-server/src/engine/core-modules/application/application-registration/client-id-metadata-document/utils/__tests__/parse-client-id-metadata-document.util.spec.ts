import { parseClientIdMetadataDocument } from 'src/engine/core-modules/application/application-registration/client-id-metadata-document/utils/parse-client-id-metadata-document.util';

const CLIENT_ID = 'https://client.example.com/oauth/client';

const validDocument = {
  client_id: CLIENT_ID,
  client_name: 'Example client',
  redirect_uris: ['https://client.example.com/callback'],
  scope: 'api unknown',
  logo_uri: 'https://client.example.com/logo.png',
};

describe('parseClientIdMetadataDocument', () => {
  it('keeps supported scopes and the https logo', () => {
    expect(parseClientIdMetadataDocument(validDocument, CLIENT_ID)).toEqual({
      clientName: 'Example client',
      redirectUris: ['https://client.example.com/callback'],
      scopes: ['api'],
      logoUri: 'https://client.example.com/logo.png',
    });
  });

  it('falls back to the client host when the document has no name', () => {
    expect(
      parseClientIdMetadataDocument(
        { ...validDocument, client_name: undefined },
        CLIENT_ID,
      )?.clientName,
    ).toBe('client.example.com');
  });

  it.each([
    [
      'a document served for another client_id',
      { client_id: 'https://other.example.com/client' },
    ],
    ['a shared secret', { client_secret: 'secret' }],
    [
      'a confidential auth method',
      { token_endpoint_auth_method: 'client_secret_post' },
    ],
    ['no redirect URIs', { redirect_uris: [] }],
    [
      'an insecure redirect URI',
      { redirect_uris: ['http://client.example.com/callback'] },
    ],
  ])('rejects %s', (_description, override) => {
    expect(
      parseClientIdMetadataDocument(
        { ...validDocument, ...override },
        CLIENT_ID,
      ),
    ).toBeNull();
  });
});
