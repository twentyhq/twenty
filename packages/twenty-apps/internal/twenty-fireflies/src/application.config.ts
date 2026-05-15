import { defineApplication } from 'twenty-sdk/define';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  FIREFLIES_API_KEY_VARIABLE_UNIVERSAL_IDENTIFIER,
  FIREFLIES_WEBHOOK_SECRET_VARIABLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Twenty Fireflies',
  description:
    'Sync Fireflies call transcripts into Twenty. When a Fireflies meeting recording finishes processing, the transcript is automatically written onto the matching CalendarEvent.',
  logoUrl: 'public/twenty-fireflies.svg',
  author: 'Twenty',
  category: 'Productivity',
  aboutDescription:
    'Official Fireflies connector for Twenty CRM. Targets Fireflies Webhooks V2 (https://app.fireflies.ai/integrations/api/webhook) and subscribes to the meeting.transcribed event. Generate a Fireflies API key at https://app.fireflies.ai/integrations/custom/api, paste it into the FIREFLIES_API_KEY application variable, point the V2 webhook at this app with FIREFLIES_WEBHOOK_SECRET as the signing secret, and call transcripts will land on the matching CalendarEvent records automatically.',
  websiteUrl: 'https://docs.twenty.com/developers/extend/apps/getting-started',
  termsUrl: 'https://www.twenty.com/terms',
  emailSupport: 'contact@twenty.com',
  issueReportUrl: 'https://github.com/twentyhq/twenty/issues',
  applicationVariables: {
    FIREFLIES_API_KEY: {
      universalIdentifier: FIREFLIES_API_KEY_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'API key from Fireflies (Integrations → Fireflies API → Generate). Used as a Bearer token against https://api.fireflies.ai/graphql to fetch full transcript content after a webhook fires.',
      isSecret: true,
    },
    FIREFLIES_WEBHOOK_SECRET: {
      universalIdentifier: FIREFLIES_WEBHOOK_SECRET_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'Signing secret for verifying Fireflies Webhooks V2 payloads (sent in the X-Hub-Signature header as sha256=<hex-hmac-sha256-of-body>). Configure the same value on the Fireflies V2 webhook setup page.',
      isSecret: true,
    },
  },
});
