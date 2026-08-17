import { defineApplication } from 'twenty-sdk/define';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  FIREFLIES_API_KEY_VARIABLE_UNIVERSAL_IDENTIFIER,
  FIREFLIES_WEBHOOK_SECRET_VARIABLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Fireflies',
  description:
    'Sync Fireflies call transcripts and AI summaries into CallRecording records linked to matching CalendarEvents in Twenty, and trigger sync / list / search of Fireflies calls from workflows and the AI chat.',
  logoUrl: 'public/twenty-fireflies.svg',
  author: 'Twenty',
  category: 'Productivity',
  screenshots: [
    'public/gallery/workflow-builder-actions.png',
    'public/gallery/app-settings.png',
  ],
  websiteUrl: 'https://docs.twenty.com/developers/extend/apps/getting-started',
  termsUrl: 'https://www.twenty.com/terms',
  emailSupport: 'contact@twenty.com',
  issueReportUrl: 'https://github.com/twentyhq/twenty/issues',
  applicationVariables: {
    FIREFLIES_API_KEY: {
      universalIdentifier: FIREFLIES_API_KEY_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'Your Fireflies API key (Fireflies → Integrations → Fireflies API).',
      isSecret: true,
    },
    FIREFLIES_WEBHOOK_SECRET: {
      universalIdentifier:
        FIREFLIES_WEBHOOK_SECRET_VARIABLE_UNIVERSAL_IDENTIFIER,
      description: 'Signing secret from the Fireflies Webhooks V2 setup page.',
      isSecret: true,
    },
  },
});
