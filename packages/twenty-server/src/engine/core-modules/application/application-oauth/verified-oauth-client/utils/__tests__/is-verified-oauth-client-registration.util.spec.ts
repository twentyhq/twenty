import { isVerifiedOAuthClientRegistration } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/is-verified-oauth-client-registration.util';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

const SEEDED_TWENTY_CLI_REGISTRATION = {
  universalIdentifier: TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
  sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
  ownerWorkspaceId: null,
  createdByUserId: null,
  oAuthClientSecretHash: null,
};

describe('isVerifiedOAuthClientRegistration', () => {
  it('should recognise the Twenty CLI registration the server seeds', () => {
    expect(
      isVerifiedOAuthClientRegistration(SEEDED_TWENTY_CLI_REGISTRATION),
    ).toBe(true);
  });

  it.each([
    {
      case: 'another universal identifier',
      overrides: {
        universalIdentifier: '2b1f0d5e-6f0f-4f0e-9a43-0f6b3c1f2a10',
      },
    },
    {
      case: 'a workspace owner',
      overrides: { ownerWorkspaceId: '7f0a3a4e-2c7c-4a55-9a53-3f1f3f6f0a11' },
    },
    {
      case: 'a creator',
      overrides: { createdByUserId: '9d1c2b3a-4e5f-4a6b-8c7d-0e1f2a3b4c5d' },
    },
    {
      case: 'a client secret',
      overrides: { oAuthClientSecretHash: 'hash' },
    },
    {
      case: 'another source type',
      overrides: { sourceType: ApplicationRegistrationSourceType.NPM },
    },
  ])(
    'should not recognise a registration with the Twenty CLI identifier and $case',
    ({ overrides }) => {
      expect(
        isVerifiedOAuthClientRegistration({
          ...SEEDED_TWENTY_CLI_REGISTRATION,
          ...overrides,
        }),
      ).toBe(false);
    },
  );
});
