import { MARKETPLACE_CONNECT_LISTING_UNIVERSAL_IDENTIFIERS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-connect-listing-universal-identifiers.constant';
import { findMarketplaceConnectListingForRegistration } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/find-marketplace-connect-listing-for-registration.util';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

const PUBLIC_CLIENT_REGISTRATION = {
  universalIdentifier: '2b1f0d5e-6f0f-4f0e-9a43-0f6b3c1f2a10',
  sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
  ownerWorkspaceId: null,
  createdByUserId: null,
  oAuthClientSecretHash: null,
};

describe('findMarketplaceConnectListingForRegistration', () => {
  it.each([
    'https://claude.ai/oauth/mcp-oauth-client-metadata',
    'https://claude.ai/oauth/claude-code-client-metadata',
  ])('should return the Claude card for the %s client', (oAuthClientId) => {
    const connectListing = findMarketplaceConnectListingForRegistration({
      ...PUBLIC_CLIENT_REGISTRATION,
      oAuthClientId,
    });

    expect(connectListing?.universalIdentifier).toBe(
      MARKETPLACE_CONNECT_LISTING_UNIVERSAL_IDENTIFIERS.CLAUDE,
    );
    expect(connectListing?.logoPath).toBe('/images/oauth-clients/claude.webp');
  });

  it('should return the Twenty CLI card for the seeded CLI registration', () => {
    expect(
      findMarketplaceConnectListingForRegistration({
        ...PUBLIC_CLIENT_REGISTRATION,
        universalIdentifier:
          TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
        oAuthClientId: '9d57f169-1682-4169-b6f0-cd5f09ace06e',
      })?.universalIdentifier,
    ).toBe(MARKETPLACE_CONNECT_LISTING_UNIVERSAL_IDENTIFIERS.TWENTY_CLI);
  });

  it('should return nothing for a dynamically registered client named after a verified one', () => {
    expect(
      findMarketplaceConnectListingForRegistration({
        ...PUBLIC_CLIENT_REGISTRATION,
        oAuthClientId: '4c3e1a7b-5d2f-4e8a-9b6c-1f0a2d3e4b5c',
      }),
    ).toBeUndefined();
  });

  it('should return nothing without a registration', () => {
    expect(findMarketplaceConnectListingForRegistration(null)).toBeUndefined();
  });
});
