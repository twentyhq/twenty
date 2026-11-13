import { TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';

import { MARKETPLACE_BUILT_IN_APPLICATION_UNIVERSAL_IDENTIFIERS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-built-in-application-universal-identifiers.constant';
import { findVerifiedOAuthClientForRegistration } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/find-verified-oauth-client-for-registration.util';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

const SERVER_SEEDED_SHAPE = {
  sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
  ownerWorkspaceId: null,
  createdByUserId: null,
  oAuthClientSecretHash: null,
};

describe('findVerifiedOAuthClientForRegistration', () => {
  it('should tie the seeded Twenty CLI registration to its store card', () => {
    expect(
      findVerifiedOAuthClientForRegistration({
        ...SERVER_SEEDED_SHAPE,
        universalIdentifier:
          TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
        oAuthClientId: '9d57f169-1682-4169-b6f0-cd5f09ace06e',
      })?.marketplaceAppUniversalIdentifier,
    ).toBe(MARKETPLACE_BUILT_IN_APPLICATION_UNIVERSAL_IDENTIFIERS.TWENTY_CLI);
  });

  it.each([
    'https://claude.ai/oauth/mcp-oauth-client-metadata',
    'https://claude.ai/oauth/claude-code-client-metadata',
  ])('should tie the %s client to the Claude card', (oAuthClientId) => {
    expect(
      findVerifiedOAuthClientForRegistration({
        ...SERVER_SEEDED_SHAPE,
        universalIdentifier: '2b1f0d5e-6f0f-4f0e-9a43-0f6b3c1f2a10',
        oAuthClientId,
      })?.marketplaceAppUniversalIdentifier,
    ).toBe(TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.CLAUDE);
  });

  it('should find nothing for a registration that only carries the CLI identifier', () => {
    expect(
      findVerifiedOAuthClientForRegistration({
        ...SERVER_SEEDED_SHAPE,
        ownerWorkspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        universalIdentifier:
          TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
        oAuthClientId: '9d57f169-1682-4169-b6f0-cd5f09ace06e',
      }),
    ).toBeUndefined();
  });

  it('should find nothing for an ordinary registration', () => {
    expect(
      findVerifiedOAuthClientForRegistration({
        ...SERVER_SEEDED_SHAPE,
        universalIdentifier: '2b1f0d5e-6f0f-4f0e-9a43-0f6b3c1f2a10',
        oAuthClientId: '4c3e1a7b-5d2f-4e8a-9b6c-1f0a2d3e4b5c',
      }),
    ).toBeUndefined();
  });
});
