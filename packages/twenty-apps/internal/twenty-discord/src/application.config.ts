import { defineApplication } from 'twenty-sdk/define';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  DISCORD_BOT_TOKEN_VARIABLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Twenty Discord',
  description:
    'Connect Discord to Twenty. Workflow steps post, update, and delete bot messages and add reactions using a Discord bot token shared across the deployment.',
  logoUrl: 'public/twenty-discord.svg',
  author: 'Twenty',
  category: 'Communication',
  aboutDescription:
    'Official Discord connector for Twenty CRM. Create a Discord application at https://discord.com/developers/applications, copy its bot token into the DISCORD_BOT_TOKEN application variable, then invite the bot to each server you want workflows to post in. Use workflow actions to post, update, or delete bot messages and add reactions.',
  websiteUrl: 'https://docs.twenty.com/developers/extend/apps/getting-started',
  termsUrl: 'https://www.twenty.com/terms',
  emailSupport: 'contact@twenty.com',
  issueReportUrl: 'https://github.com/twentyhq/twenty/issues',
  applicationVariables: {
    DISCORD_BOT_TOKEN: {
      universalIdentifier: DISCORD_BOT_TOKEN_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'Bot token from your Discord application (Developer Portal → Bot tab → Reset Token). Used with the `Bot` auth prefix to call the Discord REST API. The same token authenticates the bot across every guild it has been invited to.',
      isSecret: true,
    },
  },
});
