import { defineApplication } from 'twenty-sdk/define';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import {
  RESEND_API_KEY_UNIVERSAL_IDENTIFIER,
  RESEND_WEBHOOK_SECRET_UNIVERSAL_IDENTIFIER,
} from 'src/modules/resend/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  logoUrl: 'public/resend-icon-black.svg',
  applicationVariables: {
    RESEND_API_KEY: {
      universalIdentifier: RESEND_API_KEY_UNIVERSAL_IDENTIFIER,
      description: 'API key for the Resend service',
      isSecret: true,
    },
    RESEND_WEBHOOK_SECRET: {
      universalIdentifier: RESEND_WEBHOOK_SECRET_UNIVERSAL_IDENTIFIER,
      description: 'Signing secret for verifying Resend webhook payloads',
      isSecret: true,
    },
  },
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});
