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
    'Sync Fireflies call transcripts and AI summaries onto matching CalendarEvent records in Twenty, and trigger sync / list / search of Fireflies calls from workflows and the AI chat.',
  logoUrl: 'public/twenty-fireflies.svg',
  author: 'Twenty',
  category: 'Productivity',
  aboutDescription:
    'Official Fireflies connector for Twenty CRM. Targets Fireflies Webhooks V2 (https://app.fireflies.ai/integrations/api/webhook), subscribing to the meeting.transcribed and meeting.summarized events to write the transcript and AI summary onto the matching CalendarEvent. Also exposes three workflow tools — Sync Fireflies Call (on-demand sync, useful for backfilling), List Fireflies Calls By Participant (find past calls with a contact), and Search Fireflies Calls (keyword search over titles and spoken content). Generate a Fireflies API key at https://app.fireflies.ai/integrations/custom/api and paste it into the FIREFLIES_API_KEY application variable; configure the V2 webhook with FIREFLIES_WEBHOOK_SECRET as the signing secret.',
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
