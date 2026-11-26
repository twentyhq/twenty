import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TELEGRAM_PLAIN_MESSAGE_MAX_LENGTH } from 'src/logic-functions/constants/telegram-plain-message-max-length';
import { TELEGRAM_RICH_MESSAGE_MAX_LENGTH } from 'src/logic-functions/constants/telegram-rich-message-max-length';
import { TELEGRAM_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/telegram-assistant-request-status';
import { claimTelegramAssistantRequest } from 'src/logic-functions/data/claim-telegram-assistant-request';
import { findTelegramAssistantHistory } from 'src/logic-functions/data/find-telegram-assistant-history';
import { updateTelegramAssistantRequest } from 'src/logic-functions/data/update-telegram-assistant-request';
import { buildTelegramAssistantAnswerText } from 'src/logic-functions/utils/build-telegram-assistant-answer-text';
import { fetchWorkspaceBaseUrl } from 'src/logic-functions/utils/fetch-workspace-base-url';
import { getTelegramAssistantFailureText } from 'src/logic-functions/utils/get-telegram-assistant-failure-text';
import { recordTelegramAssistantRequestOrThrow } from 'src/logic-functions/utils/record-telegram-assistant-request-or-throw';
import { runTelegramAssistantAgentOrThrow } from 'src/logic-functions/utils/run-telegram-assistant-agent-or-throw';
import { sendTelegramAnswer } from 'src/logic-functions/utils/send-telegram-answer';
import { sendTelegramMessage } from 'src/logic-functions/utils/send-telegram-message';
import { startTelegramTyping } from 'src/logic-functions/utils/start-telegram-typing';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message';

export const answerTelegramAssistantRequest = async ({
  client,
  botToken,
  chatId,
  messageId,
  telegramUserId,
  workspaceMemberId,
  requestText,
  agentDeadlineAtMs,
  deliveryDeadlineAtMs,
}: {
  client: Pick<CoreApiClient, 'query' | 'mutation'>;
  botToken: string;
  chatId: number;
  messageId: number;
  telegramUserId: string;
  workspaceMemberId: string;
  requestText: string;
  agentDeadlineAtMs: number;
  deliveryDeadlineAtMs: number;
}): Promise<'ANSWERED' | 'FAILED' | 'SKIPPED'> => {
  const telegramChatId = `${chatId}`;
  const requestId = await recordTelegramAssistantRequestOrThrow({
    client,
    telegramChatId,
    telegramMessageId: `${messageId}`,
    telegramUserId,
    workspaceMemberId,
    requestText,
  });

  const isClaimed = await claimTelegramAssistantRequest({
    client,
    id: requestId,
  });

  if (!isClaimed) {
    return 'SKIPPED';
  }

  const stopTyping = startTelegramTyping({ botToken, chatId });

  try {
    const [history, workspaceBaseUrl] = await Promise.all([
      findTelegramAssistantHistory({
        client,
        telegramChatId,
        workspaceMemberId,
      }).catch((error: unknown) => {
        console.warn('[telegram] could not load the chat history', error);

        return [];
      }),
      fetchWorkspaceBaseUrl(),
    ]);

    const responseText = await runTelegramAssistantAgentOrThrow({
      requestText,
      history,
      workspaceMemberId,
      workspaceBaseUrl,
      deadlineAtMs: agentDeadlineAtMs,
    });

    const answer = { responseText, requestId, workspaceBaseUrl };

    await sendTelegramAnswer({
      botToken,
      chatId,
      deadlineAtMs: deliveryDeadlineAtMs,
      richText: buildTelegramAssistantAnswerText({
        ...answer,
        maxLength: TELEGRAM_RICH_MESSAGE_MAX_LENGTH,
        isPlainText: false,
      }),
      plainText: buildTelegramAssistantAnswerText({
        ...answer,
        maxLength: TELEGRAM_PLAIN_MESSAGE_MAX_LENGTH,
        isPlainText: true,
      }),
    });
    await updateTelegramAssistantRequest({
      client,
      id: requestId,
      status: TELEGRAM_ASSISTANT_REQUEST_STATUS.DONE,
      responseText,
    }).catch((updateError: unknown) => {
      console.error('[telegram] could not mark the request done', updateError);
    });

    return 'ANSWERED';
  } catch (error) {
    console.error('[telegram] could not answer the request', error);

    await updateTelegramAssistantRequest({
      client,
      id: requestId,
      status: TELEGRAM_ASSISTANT_REQUEST_STATUS.FAILED,
      errorMessage: toErrorMessage(error),
    }).catch((updateError: unknown) => {
      console.error(
        '[telegram] could not mark the request failed',
        updateError,
      );
    });
    await sendTelegramMessage({
      botToken,
      chatId,
      text: getTelegramAssistantFailureText(error),
    }).catch((sendError: unknown) => {
      console.error('[telegram] could not send the failure reply', sendError);
    });

    return 'FAILED';
  } finally {
    stopTyping();
  }
};
