import { isClientIdMetadataDocumentUrl } from 'src/engine/core-modules/application/application-registration/client-id-metadata-document/utils/is-client-id-metadata-document-url.util';

describe('isClientIdMetadataDocumentUrl', () => {
  it('accepts an https URL with a path', () => {
    expect(
      isClientIdMetadataDocumentUrl('https://client.example.com/oauth/client'),
    ).toBe(true);
  });

  it.each([
    'b5a3c9a4-8f0e-4c1e-9d3a-1f2b3c4d5e6f',
    'http://client.example.com/oauth/client',
    'https://client.example.com',
    'https://client.example.com/',
    'https://client.example.com/oauth/client#fragment',
    'https://user:password@client.example.com/oauth/client',
    'https://client.example.com/oauth/../client',
  ])('rejects %s', (clientId) => {
    expect(isClientIdMetadataDocumentUrl(clientId)).toBe(false);
  });
});
