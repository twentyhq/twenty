import { defineApplication, FieldType } from 'twenty-sdk/define';

import { APP_DESCRIPTION } from 'src/constants/app-description';
import { APP_DISPLAY_NAME } from 'src/constants/app-display-name';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/application-universal-identifier';
import {
  DIRECTUS_API_KEY_ENV_VAR_NAME,
  DIRECTUS_URL_ENV_VAR_NAME,
} from 'src/constants/server-variable-names';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,

  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,

  logoUrl: 'public/logo.svg',
  category: 'Productivity',
  author: 'Twenty',

  screenshots: [],

  applicationVariables: {},

  serverVariables: {
    [DIRECTUS_URL_ENV_VAR_NAME]: {
      description:
        'Base URL of the Directus executive portal instance (e.g. https://directus.firm.example). Set by the server admin before enabling Directus sync in PR4.',
      isSecret: false,
      isRequired: false,
      type: FieldType.TEXT,
    },
    [DIRECTUS_API_KEY_ENV_VAR_NAME]: {
      description:
        'Directus static access token with read-only schema, item, and file permissions. Set by the server admin; must be rotated on schedule. Sync remains disabled until the PR4 exit gate.',
      isSecret: true,
      isRequired: false,
      type: FieldType.TEXT,
    },
  },
});
