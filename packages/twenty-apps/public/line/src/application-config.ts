import { defineApplication } from 'twenty-sdk/define';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  LINE_APPLICATION_VARIABLE_CHANNEL_SECRET_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  logo: 'public/logo.svg',
  author: 'Twenty',
  applicationVariables: {
    CHANNEL_SECRET: {
      universalIdentifier:
        LINE_APPLICATION_VARIABLE_CHANNEL_SECRET_UNIVERSAL_IDENTIFIER,
      isSecret: true,
      description:
        'Channel secret of the Messaging API channel, used to check that webhooks come from LINE',
    },
  },
  category: 'Communication',
  emailSupport: 'contact@twenty.com',
});
