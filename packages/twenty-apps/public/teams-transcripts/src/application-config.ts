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
  author: 'Twenty',
  category: 'Productivity',
  serverVariables: {
    MICROSOFT_CLIENT_ID: {
      description: 'OAuth client ID from the Microsoft Entra app registration.',
      isSecret: false,
      isRequired: true,
    },
    MICROSOFT_CLIENT_SECRET: {
      description:
        'OAuth client secret value from the Microsoft Entra app registration.',
      isSecret: true,
      isRequired: true,
    },
  },
});
