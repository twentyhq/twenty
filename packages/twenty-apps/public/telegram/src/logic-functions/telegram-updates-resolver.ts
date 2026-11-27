import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  kv,
  Response,
  type ServerRouteResolverResult,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import {
  TELEGRAM_UPDATE_HANDLER_UNIVERSAL_IDENTIFIER,
  TELEGRAM_UPDATES_RESOLVER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { TELEGRAM_LINK_EXPIRED_TEXT } from 'src/logic-functions/constants/telegram-link-expired-text';
import { TELEGRAM_NOT_CONNECTED_TEXT } from 'src/logic-functions/constants/telegram-not-connected-text';
import { TELEGRAM_WEBHOOK_SECRET_HEADER_NAME } from 'src/logic-functions/constants/telegram-webhook-secret-header-name';
import { type TelegramUpdate } from 'src/logic-functions/types/telegram-update.type';
import { type TelegramUpdatesDispatchPayload } from 'src/logic-functions/types/telegram-updates-dispatch-payload.type';
import { buildTelegramCallbackQueryWebhookReply } from 'src/logic-functions/utils/build-telegram-callback-query-webhook-reply';
import { buildTelegramLinkTokenKvKey } from 'src/logic-functions/utils/build-telegram-link-token-kv-key';
import { buildTelegramUserKvKey } from 'src/logic-functions/utils/build-telegram-user-kv-key';
import { buildTelegramWebhookReply } from 'src/logic-functions/utils/build-telegram-webhook-reply';
import { getTelegramBotCredentials } from 'src/logic-functions/utils/get-telegram-bot-credentials';
import { hashTelegramLinkToken } from 'src/logic-functions/utils/hash-telegram-link-token';
import { isTelegramWebhookSecretValid } from 'src/logic-functions/utils/is-telegram-webhook-secret-valid';
import { parseTelegramUpdate } from 'src/logic-functions/utils/parse-telegram-update';

export const telegramUpdatesResolverHandler = async (
  routePayload: Pick<RoutePayload<TelegramUpdate>, 'headers' | 'body'>,
): Promise<ServerRouteResolverResult> => {
  const botCredentials = getTelegramBotCredentials();

  if (!botCredentials.success) {
    return new Response({ error: botCredentials.error }, { status: 503 });
  }

  if (
    !isTelegramWebhookSecretValid({
      received: routePayload.headers[TELEGRAM_WEBHOOK_SECRET_HEADER_NAME],
      expected: botCredentials.credentials.webhookSecret,
    })
  ) {
    return new Response({ error: 'Unauthorized' }, { status: 401 });
  }

  const update = routePayload.body;
  const event = parseTelegramUpdate(update);

  if (!isDefined(update) || !isDefined(event)) {
    return new Response({ ok: true, skipped: 'Unsupported update' });
  }

  const workspaceId = await kv.get<string>(
    event.kind === 'LINK_START'
      ? buildTelegramLinkTokenKvKey(hashTelegramLinkToken(event.token))
      : buildTelegramUserKvKey(`${event.user.id}`),
    { scope: 'SERVER' },
  );

  if (isNonEmptyString(workspaceId)) {
    return {
      workspaceId,
      targetLogicFunctionUniversalIdentifier:
        TELEGRAM_UPDATE_HANDLER_UNIVERSAL_IDENTIFIER,
      payload: { update } satisfies TelegramUpdatesDispatchPayload,
    };
  }

  if (event.kind === 'BLOCKED') {
    return new Response({ ok: true, skipped: 'Sender is not connected' });
  }

  if (event.kind === 'FEEDBACK') {
    return buildTelegramCallbackQueryWebhookReply({
      callbackQueryId: event.callbackQueryId,
      text: TELEGRAM_NOT_CONNECTED_TEXT,
    });
  }

  return buildTelegramWebhookReply({
    chatId: event.chatId,
    text:
      event.kind === 'LINK_START'
        ? TELEGRAM_LINK_EXPIRED_TEXT
        : TELEGRAM_NOT_CONNECTED_TEXT,
  });
};

export default defineLogicFunction({
  universalIdentifier: TELEGRAM_UPDATES_RESOLVER_UNIVERSAL_IDENTIFIER,
  name: 'telegram-updates-resolver',
  description:
    'Receives Telegram bot updates, checks the webhook secret, and routes direct messages and button taps to the workspace that claimed their sender or their connection link. Senders no workspace claims get a fixed reply and nothing is stored.',
  timeoutSeconds: 15,
  handler: telegramUpdatesResolverHandler,
  serverRouteTriggerSettings: {
    httpMethods: ['POST'],
    forwardedRequestHeaders: [TELEGRAM_WEBHOOK_SECRET_HEADER_NAME],
  },
});
