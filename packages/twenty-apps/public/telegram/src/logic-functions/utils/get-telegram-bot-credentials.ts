import { isNonEmptyString } from '@sniptt/guards';

import { type TelegramBotCredentialsResult } from 'src/logic-functions/types/telegram-bot-credentials-result.type';

export const getTelegramBotCredentials = (): TelegramBotCredentialsResult => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!isNonEmptyString(botToken) || !isNonEmptyString(webhookSecret)) {
    return {
      success: false,
      error:
        'The Telegram bot is not configured: TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET must be set on the server.',
    };
  }

  return { success: true, credentials: { botToken, webhookSecret } };
};
