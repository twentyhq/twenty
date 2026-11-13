import { findMarketplaceAppUniversalIdentifiersByClientIdMetadataDocumentUrl } from 'src/engine/core-modules/application/application-marketplace/utils/find-marketplace-app-universal-identifiers-by-client-id-metadata-document-url.util';

const CLIENT_URL = 'https://client.example.com/oauth/client.json';
const OTHER_CLIENT_URL = 'https://other.example.com/oauth/client.json';

describe('findMarketplaceAppUniversalIdentifiersByClientIdMetadataDocumentUrl', () => {
  it('should name the listed app that declares a document URL', () => {
    expect(
      findMarketplaceAppUniversalIdentifiersByClientIdMetadataDocumentUrl([
        {
          id: 'listed-app',
          isListed: true,
          clientIdMetadataDocumentUrls: [CLIENT_URL, OTHER_CLIENT_URL],
        },
        { id: 'app-without-client', isListed: true },
      ]),
    ).toEqual({
      [CLIENT_URL]: 'listed-app',
      [OTHER_CLIENT_URL]: 'listed-app',
    });
  });

  it('should ignore a document URL declared by an unlisted app', () => {
    expect(
      findMarketplaceAppUniversalIdentifiersByClientIdMetadataDocumentUrl([
        {
          id: 'unlisted-app',
          isListed: false,
          clientIdMetadataDocumentUrls: [CLIENT_URL],
        },
      ]),
    ).toEqual({});
  });

  it('should name no app for a document URL two listed apps declare', () => {
    expect(
      findMarketplaceAppUniversalIdentifiersByClientIdMetadataDocumentUrl([
        {
          id: 'listed-app',
          isListed: true,
          clientIdMetadataDocumentUrls: [CLIENT_URL, OTHER_CLIENT_URL],
        },
        {
          id: 'second-listed-app',
          isListed: true,
          clientIdMetadataDocumentUrls: [CLIENT_URL],
        },
      ]),
    ).toEqual({ [OTHER_CLIENT_URL]: 'listed-app' });
  });
});
