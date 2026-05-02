import { defineApplication } from 'twenty-sdk/define';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  LINEAR_CLIENT_ID_VARIABLE_UNIVERSAL_IDENTIFIER,
  LINEAR_CLIENT_SECRET_VARIABLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Linear',
  description:
    'Connect Linear to Twenty. Each workspace member connects their own Linear account; logic functions can then create issues and read team data on their behalf.',
  icon: 'IconBrandLinear',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  applicationVariables: {
    LINEAR_CLIENT_ID: {
      universalIdentifier: LINEAR_CLIENT_ID_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'OAuth client ID from your Linear OAuth application (linear.app/settings/api/applications).',
      isSecret: false,
    },
    LINEAR_CLIENT_SECRET: {
      universalIdentifier: LINEAR_CLIENT_SECRET_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'OAuth client secret from your Linear OAuth application. Stored encrypted; never exposed in API responses.',
      isSecret: true,
    },
  },
});
