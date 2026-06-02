import { defineApplication } from 'twenty-sdk/define';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
} from '@constants/universal-identifiers';
import {
  INITIAL_SYNC_MODE_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
  RESEND_API_KEY_UNIVERSAL_IDENTIFIER,
  RESEND_WEBHOOK_SECRET_UNIVERSAL_IDENTIFIER,
} from '@modules/resend/constants/universal-identifiers';

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
    INITIAL_SYNC_MODE: {
      universalIdentifier: INITIAL_SYNC_MODE_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        "When 'true', the initial-sync cron runs and the intermediate-sync cron is paused. Flipped to 'false' once every list has completed.",
      isSecret: false,
      value: 'false',
    },
  },
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});
