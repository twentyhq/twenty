import { MARKETPLACE_BUILT_IN_APPLICATION_UNIVERSAL_IDENTIFIERS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-built-in-application-universal-identifiers.constant';
import { findMarketplaceBuiltInApplicationForRegistration } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/find-marketplace-built-in-application-for-registration.util';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

const PUBLIC_CLIENT_REGISTRATION = {
  universalIdentifier: '2b1f0d5e-6f0f-4f0e-9a43-0f6b3c1f2a10',
  sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
  ownerWorkspaceId: null,
  createdByUserId: null,
  oAuthClientSecretHash: null,
};

describe('findMarketplaceBuiltInApplicationForRegistration', () => {
  it.each([
    'https://claude.ai/oauth/mcp-oauth-client-metadata',
    'https://claude.ai/oauth/claude-code-client-metadata',
  ])('should return the Claude card for the %s client', (oAuthClientId) => {
    const builtInApplication = findMarketplaceBuiltInApplicationForRegistration(
      { ...PUBLIC_CLIENT_REGISTRATION, oAuthClientId },
    );

    expect(builtInApplication?.universalIdentifier).toBe(
      MARKETPLACE_BUILT_IN_APPLICATION_UNIVERSAL_IDENTIFIERS.CLAUDE,
    );
    expect(builtInApplication?.logoPath).toBe(
      '/images/oauth-clients/claude.webp',
    );
  });

  it('should return the Twenty CLI card for the seeded CLI registration', () => {
    expect(
      findMarketplaceBuiltInApplicationForRegistration({
        ...PUBLIC_CLIENT_REGISTRATION,
        universalIdentifier:
          TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
        oAuthClientId: '9d57f169-1682-4169-b6f0-cd5f09ace06e',
      })?.universalIdentifier,
    ).toBe(MARKETPLACE_BUILT_IN_APPLICATION_UNIVERSAL_IDENTIFIERS.TWENTY_CLI);
  });

  it('should return nothing for a dynamically registered client named after a verified one', () => {
    expect(
      findMarketplaceBuiltInApplicationForRegistration({
        ...PUBLIC_CLIENT_REGISTRATION,
        oAuthClientId: '4c3e1a7b-5d2f-4e8a-9b6c-1f0a2d3e4b5c',
      }),
    ).toBeUndefined();
  });

  it('should return nothing without a registration', () => {
    expect(
      findMarketplaceBuiltInApplicationForRegistration(null),
    ).toBeUndefined();
  });
});
