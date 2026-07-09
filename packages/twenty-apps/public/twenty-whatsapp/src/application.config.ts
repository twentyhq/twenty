import { defineApplication } from 'twenty-sdk/define';

import { WHATSAPP_ENVIRONMENT_VARIABLE_NAMES } from 'src/constants/environment-variable-names';
import { WHATSAPP_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: WHATSAPP_UNIVERSAL_IDENTIFIERS.application,
  displayName: 'WhatsApp',
  description:
    'Send and receive WhatsApp messages from Twenty through the WhatsApp Business Cloud API.',
  logoUrl: 'public/logo.svg',
  category: 'Communication',
  author: 'Twenty',
  applicationVariables: {
    [WHATSAPP_ENVIRONMENT_VARIABLE_NAMES.phoneNumberId]: {
      universalIdentifier:
        WHATSAPP_UNIVERSAL_IDENTIFIERS.phoneNumberIdApplicationVariable,
      description:
        'WhatsApp Business phone number id used to send messages through the Cloud API.',
      isSecret: false,
    },
  },
  serverVariables: {
    [WHATSAPP_ENVIRONMENT_VARIABLE_NAMES.metaAppId]: {
      description: 'Meta app id used for the WhatsApp Business OAuth flow.',
      isSecret: false,
      isRequired: true,
    },
    [WHATSAPP_ENVIRONMENT_VARIABLE_NAMES.metaAppSecret]: {
      description:
        'Meta app secret used for the OAuth flow and to verify webhook payload signatures.',
      isSecret: true,
      isRequired: true,
    },
    [WHATSAPP_ENVIRONMENT_VARIABLE_NAMES.webhookVerifyToken]: {
      description:
        'Token the Meta webhook subscription echoes during verification. Must match the value configured on the Meta app webhook settings.',
      isSecret: true,
      isRequired: true,
    },
  },
});
