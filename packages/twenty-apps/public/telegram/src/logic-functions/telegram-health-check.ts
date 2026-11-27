import { isNonEmptyArray, isNonEmptyString, isNumber } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  type ApplicationHealthCheckResult,
  defineHealthCheck,
} from 'twenty-sdk/define';
import { getServerRouteUrl } from 'twenty-sdk/utils';

import {
  TELEGRAM_HEALTH_CHECK_UNIVERSAL_IDENTIFIER,
  TELEGRAM_UPDATES_RESOLVER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { TELEGRAM_REJECTED_BOT_TOKEN_ERROR_CODES } from 'src/logic-functions/constants/telegram-rejected-bot-token-error-codes';
import { TELEGRAM_WEBHOOK_ERROR_WINDOW_SECONDS } from 'src/logic-functions/constants/telegram-webhook-error-window-seconds';
import { findTelegramUserLinks } from 'src/logic-functions/data/find-telegram-user-links';
import { TelegramApiError } from 'src/logic-functions/types/telegram-api-error';
import { type TelegramWebhookInfo } from 'src/logic-functions/types/telegram-webhook-info.type';
import { callTelegramApiOrThrow } from 'src/logic-functions/utils/call-telegram-api-or-throw';
import { getTelegramBotCredentials } from 'src/logic-functions/utils/get-telegram-bot-credentials';

const hasRecentDeliveryError = (webhookInfo: TelegramWebhookInfo): boolean =>
  isNonEmptyString(webhookInfo.last_error_message) &&
  isNumber(webhookInfo.last_error_date) &&
  Date.now() / 1000 - webhookInfo.last_error_date <
    TELEGRAM_WEBHOOK_ERROR_WINDOW_SECONDS;

export const telegramHealthCheckHandler =
  async (): Promise<ApplicationHealthCheckResult> => {
    const botCredentials = getTelegramBotCredentials();

    if (!botCredentials.success) {
      return {
        status: 'WARNING',
        title: 'The Telegram bot is not configured',
        description:
          'A server admin has to set TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET in the application variables before members can connect Telegram.',
      };
    }

    const { botToken } = botCredentials.credentials;

    try {
      const webhookInfo = await callTelegramApiOrThrow<TelegramWebhookInfo>({
        botToken,
        method: 'getWebhookInfo',
      });

      if (!isNonEmptyString(webhookInfo.url)) {
        const links = await findTelegramUserLinks({
          client: new CoreApiClient({ runAs: 'application' }),
        });

        return isNonEmptyArray(links)
          ? {
              status: 'ERROR',
              title: 'The Telegram bot is not receiving messages',
              description:
                'The bot has no webhook, so messages sent to it never reach Twenty. Open the Telegram settings and start a new connection to register it again.',
            }
          : { status: 'OK' };
      }

      if (
        webhookInfo.url !==
        getServerRouteUrl(TELEGRAM_UPDATES_RESOLVER_UNIVERSAL_IDENTIFIER)
      ) {
        return {
          status: 'ERROR',
          title: 'The Telegram bot is connected to another server',
          description:
            'The bot sends its messages to a different address than this server, so it cannot answer here. A bot token can serve one server at a time: use a separate bot, or start a new connection from the Telegram settings to take the bot over.',
        };
      }

      if (hasRecentDeliveryError(webhookInfo)) {
        return {
          status: 'WARNING',
          title: 'Telegram could not deliver messages to this server',
          description: `Telegram reported in the last hour: ${webhookInfo.last_error_message}. Check that the server URL is public and reachable over HTTPS. If Telegram reports a 401, TELEGRAM_WEBHOOK_SECRET changed: start a new connection from the Telegram settings to register it again.`,
        };
      }

      return { status: 'OK' };
    } catch (error) {
      if (!(error instanceof TelegramApiError)) {
        throw error;
      }

      if (
        TELEGRAM_REJECTED_BOT_TOKEN_ERROR_CODES.some(
          (errorCode) => errorCode === error.errorCode,
        )
      ) {
        return {
          status: 'ERROR',
          title: 'Telegram rejected the bot token',
          description:
            'Telegram does not accept the token in TELEGRAM_BOT_TOKEN, so the bot cannot answer. A server admin has to set a current token from @BotFather.',
        };
      }

      console.warn('[telegram] health check could not reach Telegram', error);

      return {
        status: 'WARNING',
        title: 'Telegram could not be reached',
        description:
          'The server could not check the bot with Telegram. If this persists, check that the server can reach api.telegram.org.',
      };
    }
  };

export default defineHealthCheck({
  universalIdentifier: TELEGRAM_HEALTH_CHECK_UNIVERSAL_IDENTIFIER,
  name: 'telegram-health-check',
  description:
    'Reports on the app settings page when the Telegram bot is not configured, its token was rejected, its webhook is missing while accounts are connected, points to another server, or Telegram recently failed to deliver updates.',
  timeoutSeconds: 30,
  handler: telegramHealthCheckHandler,
});
