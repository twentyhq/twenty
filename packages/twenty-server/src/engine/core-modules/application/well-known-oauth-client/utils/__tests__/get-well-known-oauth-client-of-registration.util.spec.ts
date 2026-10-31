import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { WELL_KNOWN_OAUTH_CLIENTS } from 'src/engine/core-modules/application/well-known-oauth-client/constants/well-known-oauth-clients.constant';
import { WellKnownOAuthClient } from 'src/engine/core-modules/application/well-known-oauth-client/enums/well-known-oauth-client.enum';
import { getWellKnownOAuthClientOfRegistration } from 'src/engine/core-modules/application/well-known-oauth-client/utils/get-well-known-oauth-client-of-registration.util';

const CLAUDE_CALLBACK = 'https://claude.ai/api/mcp/auth_callback';

const buildRegistration = (
  overrides: Partial<
    Parameters<typeof getWellKnownOAuthClientOfRegistration>[0]
  > = {},
): Parameters<typeof getWellKnownOAuthClientOfRegistration>[0] => ({
  universalIdentifier: '7f6f5a4e-0000-4000-8000-000000000001',
  sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
  ownerWorkspaceId: null,
  oAuthRedirectUris: [CLAUDE_CALLBACK],
  ...overrides,
});

describe('getWellKnownOAuthClientOfRegistration', () => {
  it('recognizes the seeded registration by its universal identifier', () => {
    const chatGpt = WELL_KNOWN_OAUTH_CLIENTS.find(
      ({ client }) => client === WellKnownOAuthClient.CHATGPT,
    );

    expect(
      getWellKnownOAuthClientOfRegistration(
        buildRegistration({
          universalIdentifier: chatGpt?.universalIdentifier,
          oAuthRedirectUris: [],
        }),
      )?.client,
    ).toBe(WellKnownOAuthClient.CHATGPT);
  });

  it('recognizes an earlier dynamically registered Claude client by its callback', () => {
    expect(
      getWellKnownOAuthClientOfRegistration(buildRegistration())?.client,
    ).toBe(WellKnownOAuthClient.CLAUDE);
  });

  it('does not trust callbacks on a workspace-owned registration', () => {
    expect(
      getWellKnownOAuthClientOfRegistration(
        buildRegistration({
          ownerWorkspaceId: '7f6f5a4e-0000-4000-8000-000000000002',
        }),
      ),
    ).toBeUndefined();
  });

  it('does not trust callbacks on a packaged application', () => {
    expect(
      getWellKnownOAuthClientOfRegistration(
        buildRegistration({
          sourceType: ApplicationRegistrationSourceType.NPM,
        }),
      ),
    ).toBeUndefined();
  });
});
