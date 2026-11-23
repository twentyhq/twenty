import { MARKETPLACE_CONNECT_LISTINGS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-connect-listings.constant';
import { buildApplicationLogoUrl } from 'src/engine/core-modules/application/utils/build-application-logo-url.util';

const URLS = {
  workspaceId: 'workspace-id',
  serverUrl: 'https://api.acme.dev',
  frontBaseUrl: 'https://app.acme.dev',
};

describe('buildApplicationLogoUrl', () => {
  it('should serve the logo bundled with the application', () => {
    expect(
      buildApplicationLogoUrl({
        ...URLS,
        application: {
          id: 'application-id',
          logo: 'public/logo.svg',
          universalIdentifier:
            MARKETPLACE_CONNECT_LISTINGS[0].universalIdentifier,
        },
      }),
    ).toBe(
      'https://api.acme.dev/public-assets/workspace-id/application-id/public/logo.svg',
    );
  });

  it('should fall back to the store card logo when nothing is bundled', () => {
    const [connectListing] = MARKETPLACE_CONNECT_LISTINGS;

    expect(
      buildApplicationLogoUrl({
        ...URLS,
        application: {
          id: 'application-id',
          logo: null,
          universalIdentifier: connectListing.universalIdentifier,
        },
      }),
    ).toBe(new URL(connectListing.logoPath, URLS.frontBaseUrl).toString());
  });

  it('should return null for an unlisted application without a logo', () => {
    expect(
      buildApplicationLogoUrl({
        ...URLS,
        application: {
          id: 'application-id',
          logo: null,
          universalIdentifier: '00000000-0000-0000-0000-000000000000',
        },
      }),
    ).toBeNull();
  });
});
