import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

const RESERVED_UNIVERSAL_IDENTIFIERS: string[] = [
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
];

export const isReservedApplicationRegistrationUniversalIdentifier = (
  universalIdentifier: string,
): boolean =>
  RESERVED_UNIVERSAL_IDENTIFIERS.includes(universalIdentifier.toLowerCase());
