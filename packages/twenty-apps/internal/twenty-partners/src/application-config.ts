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
  applicationVariables: {
    PARTNER_APPLICATION_SECRET: {
      universalIdentifier: '2026a052-9f01-4d18-b6a7-31c3a5b1c7d2',
      description:
        'Shared secret required in the X-Application-Secret header on POST /partner-applications. Must match the website route\'s PARTNER_APPLICATION_SECRET env var. Set per-workspace in Settings → Apps → Twenty Partners → Variables.',
      isSecret: true,
    },
  },
});
