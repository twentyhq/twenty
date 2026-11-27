import { definePostInstallLogicFunction } from 'twenty-sdk/define';

import { TELEGRAM_POST_INSTALL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { ensureTelegramWebhook } from 'src/logic-functions/utils/ensure-telegram-webhook';
import { getTelegramBotCredentials } from 'src/logic-functions/utils/get-telegram-bot-credentials';

export const telegramPostInstallHandler = async (): Promise<void> => {
  const botCredentials = getTelegramBotCredentials();

  if (!botCredentials.success) {
    return;
  }

  await ensureTelegramWebhook(botCredentials.credentials);
};

export default definePostInstallLogicFunction({
  universalIdentifier: TELEGRAM_POST_INSTALL_UNIVERSAL_IDENTIFIER,
  name: 'telegram-post-install',
  description:
    'Runs when the app is installed or upgraded. Registers the webhook again when the bot is configured, so Telegram sends the update types this version handles without a member having to start a new connection. Fails when Telegram refuses, so the job is retried.',
  timeoutSeconds: 30,
  shouldRunOnVersionUpgrade: true,
  shouldRunSynchronously: false,
  handler: telegramPostInstallHandler,
});
