import {
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/application';

import { isReservedApplicationRegistrationUniversalIdentifier } from 'src/engine/core-modules/application/application-registration/application-registration-seeding/utils/is-reserved-application-registration-universal-identifier.util';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

describe('isReservedApplicationRegistrationUniversalIdentifier', () => {
  it.each([
    ['the standard app', TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER],
    ['the Twenty CLI', TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier],
    ['ChatGPT', WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CHATGPT],
    ['Claude', WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CLAUDE],
  ])('reserves %s, whatever the case', (_, universalIdentifier) => {
    expect(
      isReservedApplicationRegistrationUniversalIdentifier(
        universalIdentifier.toUpperCase(),
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
