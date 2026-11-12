import { isVerifiedOAuthClientUniversalIdentifier } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/is-verified-oauth-client-universal-identifier.util';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

describe('isVerifiedOAuthClientUniversalIdentifier', () => {
  it.each([
    TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
    TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier.toUpperCase(),
  ])('should match the Twenty CLI identifier %s', (universalIdentifier) => {
    expect(isVerifiedOAuthClientUniversalIdentifier(universalIdentifier)).toBe(
      true,
    );
  });

  it('should not match another identifier', () => {
    expect(
      isVerifiedOAuthClientUniversalIdentifier(
        '2b1f0d5e-6f0f-4f0e-9a43-0f6b3c1f2a10',
      ),
    ).toBe(false);
  });
});
