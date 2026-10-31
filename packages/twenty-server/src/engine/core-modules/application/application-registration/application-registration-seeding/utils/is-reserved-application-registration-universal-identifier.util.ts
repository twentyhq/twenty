import {
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/application';

import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

const RESERVED_UNIVERSAL_IDENTIFIERS: string[] = [
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
  ...Object.values(WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS),
];

// Registrations the server provides itself: a workspace must not create or claim one, or it would control every user of it
export const isReservedApplicationRegistrationUniversalIdentifier = (
  universalIdentifier: string,
): boolean =>
  RESERVED_UNIVERSAL_IDENTIFIERS.includes(universalIdentifier.toLowerCase());
