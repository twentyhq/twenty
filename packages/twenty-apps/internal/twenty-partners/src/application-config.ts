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
    DISCORD_WEBHOOK_URL: {
      universalIdentifier: '7056c98a-e7e1-4dba-8a40-b578f30b3479',
      description:
        'Discord incoming webhook URL. When set, a notification is posted to this channel each time the application form creates a new Partner. Leave empty to disable. Set per-workspace in Settings → Apps → Twenty Partners → Variables.',
      isSecret: true,
    },
    PARTNER_APP_FRONTEND_URL: {
      universalIdentifier: '746e7bd8-8934-414e-95f5-cc266a624616',
      description:
        'Workspace front-end base URL (e.g. https://partners.twenty.com), used to build the clickable Partner record link in the Discord notification. Set per-workspace in Settings → Apps → Twenty Partners → Variables.',
      isSecret: false,
    },
  },
});
