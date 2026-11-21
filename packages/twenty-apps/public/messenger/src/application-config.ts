import { defineApplication } from 'twenty-sdk/define';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  MESSENGER_APPLICATION_VARIABLE_APP_SECRET_UNIVERSAL_IDENTIFIER,
  MESSENGER_APPLICATION_VARIABLE_VERIFY_TOKEN_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  logo: 'public/logo.svg',
  author: 'Twenty',
  applicationVariables: {
    VERIFY_TOKEN: {
      universalIdentifier:
        MESSENGER_APPLICATION_VARIABLE_VERIFY_TOKEN_UNIVERSAL_IDENTIFIER,
      isSecret: true,
      description:
        'Any secret string, entered again as the Verify Token of the Meta app webhook',
    },
    APP_SECRET: {
      universalIdentifier:
        MESSENGER_APPLICATION_VARIABLE_APP_SECRET_UNIVERSAL_IDENTIFIER,
      isSecret: true,
      description:
        'App Secret of the Meta app, used to check that webhooks come from Meta',
    },
  },
  category: 'Communication',
  emailSupport: 'contact@twenty.com',
});
