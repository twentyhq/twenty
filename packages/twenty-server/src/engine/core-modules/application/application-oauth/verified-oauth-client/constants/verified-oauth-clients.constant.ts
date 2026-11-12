import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

// logoPath is served by the front end, from its public folder.
export const VERIFIED_OAUTH_CLIENTS = [
  {
    name: TWENTY_CLI_APPLICATION_REGISTRATION.name,
    registrationUniversalIdentifier:
      TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
    logoPath: '/images/oauth-clients/twenty-cli.svg',
  },
];
