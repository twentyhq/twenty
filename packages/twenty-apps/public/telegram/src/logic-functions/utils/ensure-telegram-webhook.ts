import { getServerRouteUrl } from 'twenty-sdk/utils';

import { TELEGRAM_UPDATES_RESOLVER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { TELEGRAM_WEBHOOK_ALLOWED_UPDATES } from 'src/logic-functions/constants/telegram-webhook-allowed-updates';
import { type TelegramBotCredentials } from 'src/logic-functions/types/telegram-bot-credentials.type';
import { callTelegramApi } from 'src/logic-functions/utils/call-telegram-api';

// setWebhook is idempotent, and Telegram never reveals the secret it holds,
// so registering again is the only way to be sure a rotated secret is live.
export const ensureTelegramWebhook = async ({
  botToken,
  webhookSecret,
}: TelegramBotCredentials): Promise<void> => {
  await callTelegramApi<boolean>({
    botToken,
    method: 'setWebhook',
    params: {
      url: getServerRouteUrl(TELEGRAM_UPDATES_RESOLVER_UNIVERSAL_IDENTIFIER),
      secret_token: webhookSecret,
      allowed_updates: TELEGRAM_WEBHOOK_ALLOWED_UPDATES,
    },
  });
};
