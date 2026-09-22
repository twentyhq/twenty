import { defineApplication, FieldType } from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';
import { CHAT_ENABLED_APPLICATION_VARIABLE_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Microsoft Teams',
  description:
    'Connect Microsoft Teams to Twenty for chat, messaging workflows, and meeting transcripts.',
  logo: 'public/teams.svg',
  author: 'Twenty',
  category: 'Communication',
  websiteUrl:
    'https://github.com/twentyhq/twenty/tree/main/packages/twenty-apps/public/teams',
  termsUrl: 'https://www.twenty.com/terms',
  emailSupport: 'contact@twenty.com',
  issueReportUrl: 'https://github.com/twentyhq/twenty/issues',
  applicationVariables: {
    [CHAT_ENABLED_APPLICATION_VARIABLE_KEY]: {
      universalIdentifier:
        CHAT_ENABLED_APPLICATION_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Enable chat',
      description:
        'Use the Teams assistant and messaging workflows in this workspace.',
      type: FieldType.BOOLEAN,
      isSecret: false,
      value: false,
    },
    [TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY]: {
      universalIdentifier:
        TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Enable transcripts',
      description:
        'Import Microsoft Teams meeting transcripts into this workspace.',
      type: FieldType.BOOLEAN,
      isSecret: false,
      value: false,
    },
  },
  serverVariables: {
    MICROSOFT_CLIENT_ID: {
      description: 'OAuth client ID from the Microsoft Entra app registration.',
      isSecret: false,
      // Transcript credentials must not block chat-only installations.
      isRequired: false,
    },
    MICROSOFT_CLIENT_SECRET: {
      description:
        'OAuth client secret value from the Microsoft Entra app registration.',
      isSecret: true,
      // Transcript credentials must not block chat-only installations.
      isRequired: false,
    },
    TEAMS_BOT_APP_ID: {
      description:
        'Application (client) ID of the Entra app registration backing the Azure Bot. Public in the Bot Framework protocol and used as the expected audience when verifying inbound activities.',
      isSecret: false,
      // Optional for marketplace listing until the Azure Bot is provisioned.
      isRequired: false,
    },
    TEAMS_BOT_APP_PASSWORD: {
      description:
        'Client secret of that Entra app registration. Stored encrypted and never exposed in API responses. Used to mint Bot Connector tokens.',
      isSecret: true,
      // Optional for marketplace listing until the Azure Bot is provisioned.
      isRequired: false,
    },
    TEAMS_BOT_TENANT_ID: {
      description:
        'Directory (tenant) ID that owns the Azure Bot. Microsoft stopped issuing multi-tenant bots after 2025-07-31, so the token endpoint is tenant-scoped rather than the shared botframework.com authority.',
      isSecret: false,
      // Optional for marketplace listing until the Azure Bot is provisioned.
      isRequired: false,
    },
  },
});
