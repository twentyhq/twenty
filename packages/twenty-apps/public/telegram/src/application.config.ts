import { defineApplication } from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Telegram',
  description:
    'Connect Telegram accounts to workspace members so they can use Twenty from a direct message with the bot.',
  logo: 'public/telegram.svg',
  author: 'Twenty',
  category: 'Communication',
  websiteUrl:
    'https://github.com/twentyhq/twenty/tree/main/packages/twenty-apps/public/telegram',
  termsUrl: 'https://www.twenty.com/terms',
  emailSupport: 'contact@twenty.com',
  issueReportUrl: 'https://github.com/twentyhq/twenty/issues',
  serverVariables: {
    TELEGRAM_BOT_TOKEN: {
      description:
        'Token of the Telegram bot, from @BotFather. One bot serves every workspace of this server.',
      isSecret: true,
      isRequired: false,
    },
    TELEGRAM_WEBHOOK_SECRET: {
      description:
        'Random string of 1 to 256 characters among A-Z, a-z, 0-9, _ and -. Telegram sends it back with every update so forged requests are rejected.',
      isSecret: true,
      isRequired: false,
    },
  },
});
