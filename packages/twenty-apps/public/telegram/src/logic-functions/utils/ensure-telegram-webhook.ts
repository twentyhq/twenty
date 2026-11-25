import { getServerRouteUrl } from 'twenty-sdk/utils';

import { TELEGRAM_UPDATES_RESOLVER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { TELEGRAM_WEBHOOK_ALLOWED_UPDATES } from 'src/logic-functions/constants/telegram-webhook-allowed-updates';
import { type TelegramBotCredentials } from 'src/logic-functions/types/telegram-bot-credentials.type';
import { callTelegramApiOrThrow } from 'src/logic-functions/utils/call-telegram-api-or-throw';

export const ensureTelegramWebhook = async ({
  botToken,
  webhookSecret,
}: TelegramBotCredentials): Promise<void> => {
  await callTelegramApiOrThrow<boolean>({
    botToken,
    method: 'setWebhook',
    params: {
      url: getServerRouteUrl(TELEGRAM_UPDATES_RESOLVER_UNIVERSAL_IDENTIFIER),
      secret_token: webhookSecret,
      allowed_updates: TELEGRAM_WEBHOOK_ALLOWED_UPDATES,
    },
  });
};
