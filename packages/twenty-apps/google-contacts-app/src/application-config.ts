import { defineApplication } from 'twenty-sdk/define';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  logo: 'public/logo.svg',
  category: 'Other',
  author: 'Twenty',
  serverVariables: {
    GOOGLE_CONTACTS_CLIENT_ID: {
      description:
        'OAuth client ID issued by the third-party provider. Filled in once by the server admin on the application registration.',
      isSecret: false,
      isRequired: true,
    },
    GOOGLE_CONTACTS_CLIENT_SECRET: {
      description:
        'OAuth client secret issued by the third-party provider. Stored encrypted; never echoed in API responses.',
      isSecret: true,
      isRequired: true,
    },
  },
});
