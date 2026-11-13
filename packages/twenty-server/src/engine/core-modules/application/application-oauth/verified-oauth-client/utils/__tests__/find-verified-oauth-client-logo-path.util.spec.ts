import { findVerifiedOAuthClientLogoPath } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/find-verified-oauth-client-logo-path.util';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

describe('findVerifiedOAuthClientLogoPath', () => {
  it('should return the logo of the Twenty CLI', () => {
    expect(
      findVerifiedOAuthClientLogoPath(
        TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
      ),
    ).toBe('/images/oauth-clients/twenty-cli.svg');
  });

  it('should return nothing for another identifier', () => {
    expect(
      findVerifiedOAuthClientLogoPath('2b1f0d5e-6f0f-4f0e-9a43-0f6b3c1f2a10'),
    ).toBeNull();
  });
});
