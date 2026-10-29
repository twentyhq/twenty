import { isClientIdMetadataDocumentUrl } from 'src/engine/core-modules/application/application-registration/utils/is-client-id-metadata-document-url.util';

describe('isClientIdMetadataDocumentUrl', () => {
  it('should accept an HTTPS URL with a path', () => {
    expect(
      isClientIdMetadataDocumentUrl('https://app.example.com/oauth/client.json'),
    ).toBe(true);
  });

  it.each([
    ['a UUID', '4c1f2a5e-8d4b-4f6a-9c3e-2b7d1e0f5a6c'],
    ['an HTTP URL', 'http://app.example.com/client.json'],
    ['a URL without a path', 'https://app.example.com'],
    ['a URL with a fragment', 'https://app.example.com/client.json#main'],
    ['a URL with credentials', 'https://user:pass@app.example.com/client.json'],
    ['a URL with dot segments', 'https://app.example.com/a/../client.json'],
  ])('should reject %s', (_, clientId) => {
    expect(isClientIdMetadataDocumentUrl(clientId)).toBe(false);
  });
});
