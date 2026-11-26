import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { TELEGRAM_UPDATE_HANDLER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { TELEGRAM_ASSISTANT_AGENT_BUDGET_SECONDS } from 'src/logic-functions/constants/telegram-assistant-agent-budget-seconds';
import { TELEGRAM_ASSISTANT_DELIVERY_BUDGET_SECONDS } from 'src/logic-functions/constants/telegram-assistant-delivery-budget-seconds';
import { TELEGRAM_ASSISTANT_HELP_TEXT } from 'src/logic-functions/constants/telegram-assistant-help-text';
import { TELEGRAM_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/logic-functions/constants/telegram-assistant-request-timeout-seconds';
import { TELEGRAM_ASSISTANT_TEXT_ONLY_TEXT } from 'src/logic-functions/constants/telegram-assistant-text-only-text';
import { TELEGRAM_CONNECTED_TEXT } from 'src/logic-functions/constants/telegram-connected-text';
import { TELEGRAM_DISCONNECTED_TEXT } from 'src/logic-functions/constants/telegram-disconnected-text';
import { TELEGRAM_LINK_CONFLICT_TEXT } from 'src/logic-functions/constants/telegram-link-conflict-text';
import { TELEGRAM_LINK_EXPIRED_TEXT } from 'src/logic-functions/constants/telegram-link-expired-text';
import { TELEGRAM_NOT_CONNECTED_TEXT } from 'src/logic-functions/constants/telegram-not-connected-text';
import { findTelegramUserLinks } from 'src/logic-functions/data/find-telegram-user-links';
import { type TelegramUpdateHandlerResult } from 'src/logic-functions/types/telegram-update-handler-result.type';
import { type TelegramUpdatesDispatchPayload } from 'src/logic-functions/types/telegram-updates-dispatch-payload.type';
import { answerTelegramAssistantRequest } from 'src/logic-functions/utils/answer-telegram-assistant-request';
import { completeTelegramUserLink } from 'src/logic-functions/utils/complete-telegram-user-link';
import { disconnectTelegramUser } from 'src/logic-functions/utils/disconnect-telegram-user';
import { getTelegramBotCredentialsOrThrow } from 'src/logic-functions/utils/get-telegram-bot-credentials-or-throw';
import { parseTelegramUpdate } from 'src/logic-functions/utils/parse-telegram-update';
import { sendTelegramMessage } from 'src/logic-functions/utils/send-telegram-message';

const LINK_OUTCOME_TEXTS = {
  LINKED: TELEGRAM_CONNECTED_TEXT,
  LINK_EXPIRED: TELEGRAM_LINK_EXPIRED_TEXT,
  LINK_CONFLICT: TELEGRAM_LINK_CONFLICT_TEXT,
};

export const telegramUpdateHandler = async (
  payload: TelegramUpdatesDispatchPayload,
  context: Pick<LogicFunctionExecutionContext, 'workspaceId'>,
): Promise<TelegramUpdateHandlerResult> => {
  const startedAtMs = Date.now();
  const event = parseTelegramUpdate(payload.update);

  if (!isDefined(event)) {
    return { outcome: 'SKIPPED' };
  }

  const { botToken } = getTelegramBotCredentialsOrThrow();
  const client = new CoreApiClient({ runAs: 'application' });
  const telegramUserId = `${event.user.id}`;

  if (event.kind === 'BLOCKED') {
    await disconnectTelegramUser({ client, telegramUserId });

    return { outcome: 'DISCONNECTED' };
  }

  const reply = (text: string) =>
    sendTelegramMessage({ botToken, chatId: event.chatId, text });

  if (event.kind === 'LINK_START') {
    const outcome = await completeTelegramUserLink({
      client,
      user: event.user,
      token: event.token,
      workspaceId: context.workspaceId,
    });

    await reply(LINK_OUTCOME_TEXTS[outcome]);

    return { outcome };
  }

  if (event.kind === 'DISCONNECT') {
    await disconnectTelegramUser({ client, telegramUserId });
    await reply(TELEGRAM_DISCONNECTED_TEXT);

    return { outcome: 'DISCONNECTED' };
  }

  const links = await findTelegramUserLinks({
    client,
    filter: { telegramUserId },
  });

  const workspaceMemberId = links
    .map((link) => link.workspaceMemberId)
    .find(isDefined);

  if (!isDefined(workspaceMemberId)) {
    await disconnectTelegramUser({ client, telegramUserId });
    await reply(TELEGRAM_NOT_CONNECTED_TEXT);

    return { outcome: 'NOT_CONNECTED' };
  }

  if (!isNonEmptyString(event.text)) {
    await reply(TELEGRAM_ASSISTANT_TEXT_ONLY_TEXT);

    return { outcome: 'TEXT_ONLY' };
  }

  if (event.text.startsWith('/')) {
    await reply(TELEGRAM_ASSISTANT_HELP_TEXT);

    return { outcome: 'CONNECTED' };
  }

  const outcome = await answerTelegramAssistantRequest({
    client,
    botToken,
    chatId: event.chatId,
    messageId: event.messageId,
    telegramUserId,
    workspaceMemberId,
    requestText: event.text,
    agentDeadlineAtMs:
      startedAtMs + TELEGRAM_ASSISTANT_AGENT_BUDGET_SECONDS * 1000,
    deliveryDeadlineAtMs:
      startedAtMs + TELEGRAM_ASSISTANT_DELIVERY_BUDGET_SECONDS * 1000,
  });

  return { outcome };
};

export default defineLogicFunction({
  universalIdentifier: TELEGRAM_UPDATE_HANDLER_UNIVERSAL_IDENTIFIER,
  name: 'telegram-update-handler',
  description:
    'Receives a verified Telegram update from the updates route, in the workspace that claimed its sender or its connection link. Completes a connection started from Twenty, removes it on /disconnect or when the user blocks the bot, and otherwise records the message as a Telegram Assistant Request, once per chat and message id, runs the Telegram Assistant agent as the linked member and sends the answer back to the chat.',
  timeoutSeconds: TELEGRAM_ASSISTANT_REQUEST_TIMEOUT_SECONDS,
  handler: telegramUpdateHandler,
});
