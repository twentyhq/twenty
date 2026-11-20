import { defineApplication } from 'twenty-sdk/define';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  WHATSAPP_APPLICATION_VARIABLE_VERIFY_TOKEN,
  WHATSAPP_APPLICATION_VARIABLE_WEBHOOK_VALIDATION_SECRET,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  logoUrl: 'public/logo.svg',
  author: 'Twenty',
  applicationVariables: {
    VERIFY_TOKEN: {
      universalIdentifier: WHATSAPP_APPLICATION_VARIABLE_VERIFY_TOKEN,
      isSecret: true,
      description: 'Secret token used to validate webhooks',
    },
    WEBHOOK_VALIDATION_SECRET: {
      universalIdentifier: WHATSAPP_APPLICATION_VARIABLE_WEBHOOK_VALIDATION_SECRET,
      isSecret: true,
      description: 'Secret required to validate webhooks from WhatsApp',
    },
  },
  category: 'Messaging',
  emailSupport: 'contact@twenty.com'
});
