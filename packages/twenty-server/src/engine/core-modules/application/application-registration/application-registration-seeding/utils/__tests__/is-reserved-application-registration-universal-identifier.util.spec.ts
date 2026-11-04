import { WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';

import { isReservedApplicationRegistrationUniversalIdentifier } from 'src/engine/core-modules/application/application-registration/application-registration-seeding/utils/is-reserved-application-registration-universal-identifier.util';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

describe('isReservedApplicationRegistrationUniversalIdentifier', () => {
  it('reserves the registrations the server provides, whatever the case', () => {
    expect(
      isReservedApplicationRegistrationUniversalIdentifier(
        WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CLAUDE.toUpperCase(),
      ),
    ).toBe(true);
    expect(
      isReservedApplicationRegistrationUniversalIdentifier(
        TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
      ),
    ).toBe(true);
  });

  it('leaves other identifiers free', () => {
    expect(
      isReservedApplicationRegistrationUniversalIdentifier(
        '7f6f5a4e-0000-4000-8000-000000000001',
      ),
    ).toBe(false);
  });
});
