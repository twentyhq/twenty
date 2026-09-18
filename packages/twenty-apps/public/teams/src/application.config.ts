import { defineApplication } from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Microsoft Teams',
  description:
    'Your CRM, in the conversation. Mention the bot or message it directly to read, create, update and soft-delete records without leaving Teams, and post messages from your workflows.',
  logoUrl: 'public/teams.svg',
  author: 'Twenty',
  category: 'Communication',
  websiteUrl:
    'https://github.com/twentyhq/twenty/tree/main/packages/twenty-apps/public/teams',
  termsUrl: 'https://www.twenty.com/terms',
  emailSupport: 'contact@twenty.com',
  issueReportUrl: 'https://github.com/twentyhq/twenty/issues',
  serverVariables: {
    TEAMS_BOT_APP_ID: {
      description:
        'Application (client) ID of the Entra app registration backing the Azure Bot. Public in the Bot Framework protocol and used as the expected audience when verifying inbound activities.',
      isSecret: false,
      isRequired: true,
    },
    TEAMS_BOT_APP_PASSWORD: {
      description:
        'Client secret of that Entra app registration. Stored encrypted and never exposed in API responses. Used to mint Bot Connector tokens.',
      isSecret: true,
      isRequired: true,
    },
    TEAMS_BOT_TENANT_ID: {
      description:
        'Directory (tenant) ID that owns the Azure Bot. Microsoft stopped issuing multi-tenant bots after 2025-07-31, so the token endpoint is tenant-scoped rather than the shared botframework.com authority.',
      isSecret: false,
      isRequired: true,
    },
  },
});
