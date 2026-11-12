import { isVerifiedOAuthClientRegistration } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/is-verified-oauth-client-registration.util';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

describe('isVerifiedOAuthClientRegistration', () => {
  it('should recognise the Twenty CLI registration', () => {
    expect(
      isVerifiedOAuthClientRegistration({
        universalIdentifier:
          TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
      }),
    ).toBe(true);
  });

  it('should not recognise another registration', () => {
    expect(
      isVerifiedOAuthClientRegistration({
        universalIdentifier: '2b1f0d5e-6f0f-4f0e-9a43-0f6b3c1f2a10',
      }),
    ).toBe(false);
  });
});
