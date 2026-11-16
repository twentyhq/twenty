import { isClientIdMetadataDocumentUrl } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/utils/is-client-id-metadata-document-url.util';

describe('isClientIdMetadataDocumentUrl', () => {
  it('accepts an https URL with a path', () => {
    expect(
      isClientIdMetadataDocumentUrl('https://chatgpt.com/oauth/client.json'),
    ).toBe(true);
  });

  it('keeps registered client ids on the registration lookup', () => {
    expect(
      isClientIdMetadataDocumentUrl('3f1c2a9e-6f1b-4f0e-9d7e-2b3c4d5e6f70'),
    ).toBe(false);
  });

  it('rejects URLs the draft does not allow as client ids', () => {
    expect(isClientIdMetadataDocumentUrl('http://example.com/client')).toBe(
      false,
    );
    expect(isClientIdMetadataDocumentUrl('https://example.com/')).toBe(false);
    expect(isClientIdMetadataDocumentUrl('https://example.com/c#x')).toBe(
      false,
    );
    expect(
      isClientIdMetadataDocumentUrl('https://user:pass@example.com/client'),
    ).toBe(false);
  });
});
