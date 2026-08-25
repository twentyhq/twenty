import { defineApplication } from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Fireflies',
  description:
    'Sync call transcripts and AI summaries from every connected Fireflies account into CallRecording records linked to matching CalendarEvents in Twenty, and trigger sync / list / search from workflows and the AI chat.',
  logoUrl: 'public/twenty-fireflies.svg',
  author: 'Twenty',
  category: 'Productivity',
  screenshots: ['public/gallery/workflow-builder-actions.png'],
  websiteUrl: 'https://docs.twenty.com/developers/extend/apps/getting-started',
  termsUrl: 'https://www.twenty.com/terms',
  emailSupport: 'contact@twenty.com',
  issueReportUrl: 'https://github.com/twentyhq/twenty/issues',
  applicationVariables: undefined,
  serverVariables: {
    FIREFLIES_CLIENT_ID: {
      description: 'OAuth client ID issued by Fireflies.',
      isSecret: false,
      isRequired: true,
    },
    FIREFLIES_CLIENT_SECRET: {
      description: 'OAuth client secret issued by Fireflies.',
      isSecret: true,
      isRequired: true,
    },
  },
});
