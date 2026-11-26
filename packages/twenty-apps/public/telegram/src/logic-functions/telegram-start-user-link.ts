import { randomBytes } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  kv,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';

import { TELEGRAM_START_USER_LINK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { TELEGRAM_LINK_TOKEN_TTL_MS } from 'src/logic-functions/constants/telegram-link-token-ttl-ms';
import { TELEGRAM_USER_LINKS_START_ROUTE_PATH } from 'src/logic-functions/constants/telegram-user-links-route-path';
import { TelegramApiError } from 'src/logic-functions/types/telegram-api-error';
import { type TelegramPendingLinkToken } from 'src/logic-functions/types/telegram-pending-link-token.type';
import { type TelegramStartUserLinkResult } from 'src/logic-functions/types/telegram-start-user-link-result.type';
import { type TelegramUser } from 'src/logic-functions/types/telegram-user.type';
import { buildTelegramLinkTokenKvKey } from 'src/logic-functions/utils/build-telegram-link-token-kv-key';
import { buildTelegramPendingLinkTokenKvKey } from 'src/logic-functions/utils/build-telegram-pending-link-token-kv-key';
import { callTelegramApiOrThrow } from 'src/logic-functions/utils/call-telegram-api-or-throw';
import { deletePendingTelegramLinkToken } from 'src/logic-functions/utils/delete-pending-telegram-link-token';
import { ensureTelegramWebhook } from 'src/logic-functions/utils/ensure-telegram-webhook';
import { getTelegramBotCredentials } from 'src/logic-functions/utils/get-telegram-bot-credentials';
import { hashTelegramLinkToken } from 'src/logic-functions/utils/hash-telegram-link-token';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message';

const LINK_TOKEN_BYTE_LENGTH = 32;

export const telegramStartUserLinkHandler = async (
  _payload: unknown,
  {
    workspaceMemberId,
  }: Pick<LogicFunctionExecutionContext, 'workspaceMemberId'>,
): Promise<TelegramStartUserLinkResult> => {
  if (!isNonEmptyString(workspaceMemberId)) {
    return {
      success: false,
      message: 'Not allowed',
      error: 'Only a workspace member can connect a Telegram account.',
    };
  }

  const botCredentials = getTelegramBotCredentials();

  if (!botCredentials.success) {
    return {
      success: false,
      message: 'Telegram is not configured',
      error: botCredentials.error,
    };
  }

  try {
    const { botToken } = botCredentials.credentials;
    const bot = await callTelegramApiOrThrow<TelegramUser>({
      botToken,
      method: 'getMe',
    });

    if (!isNonEmptyString(bot.username)) {
      throw new TelegramApiError({
        method: 'getMe',
        description: 'the bot has no username',
      });
    }

    await ensureTelegramWebhook(botCredentials.credentials);

    await deletePendingTelegramLinkToken(workspaceMemberId);

    const token = randomBytes(LINK_TOKEN_BYTE_LENGTH).toString('base64url');
    const tokenHash = hashTelegramLinkToken(token);
    const tokenKey = buildTelegramLinkTokenKvKey(tokenHash);
    const expiresAtMs = Date.now() + TELEGRAM_LINK_TOKEN_TTL_MS;

    await kv.set(tokenKey, null, { scope: 'SERVER' });
    await kv.set(tokenKey, {
      workspaceMemberId,
      expiresAtMs,
    } satisfies TelegramPendingLinkToken);
    await kv.set(
      buildTelegramPendingLinkTokenKvKey(workspaceMemberId),
      tokenHash,
    );

    return {
      success: true,
      url: `https://t.me/${bot.username}?start=${token}`,
      botUsername: bot.username,
      startCommand: `/start ${token}`,
      expiresAt: new Date(expiresAtMs).toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      message: 'Could not start the Telegram connection',
      error: toErrorMessage(error),
    };
  }
};

export default defineLogicFunction({
  universalIdentifier: TELEGRAM_START_USER_LINK_UNIVERSAL_IDENTIFIER,
  name: 'telegram-start-user-link',
  description:
    'Starts connecting the Telegram account of the calling workspace member: registers the bot webhook, then returns a one-time link that opens the bot in Telegram. Opening it and pressing Start completes the connection. The link expires after 10 minutes and replaces any earlier link of that member.',
  timeoutSeconds: 30,
  httpRouteTriggerSettings: {
    path: TELEGRAM_USER_LINKS_START_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  handler: telegramStartUserLinkHandler,
});
