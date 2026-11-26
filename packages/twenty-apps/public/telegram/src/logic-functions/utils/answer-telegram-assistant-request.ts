import { type CoreApiClient } from 'twenty-client-sdk/core';

import { claimTelegramAssistantRequest } from 'src/logic-functions/data/claim-telegram-assistant-request';
import { findTelegramAssistantHistory } from 'src/logic-functions/data/find-telegram-assistant-history';
import { TelegramAssistantDeadlineError } from 'src/logic-functions/types/telegram-assistant-deadline-error';
import { deliverTelegramAssistantAnswer } from 'src/logic-functions/utils/deliver-telegram-assistant-answer';
import { failTelegramAssistantRequest } from 'src/logic-functions/utils/fail-telegram-assistant-request';
import { fetchWorkspaceBaseUrl } from 'src/logic-functions/utils/fetch-workspace-base-url';
import { keepWaitingForTelegramAssistantAnswer } from 'src/logic-functions/utils/keep-waiting-for-telegram-assistant-answer';
import { recordTelegramAssistantRequestOrThrow } from 'src/logic-functions/utils/record-telegram-assistant-request-or-throw';
import { runTelegramAssistantAgentOrThrow } from 'src/logic-functions/utils/run-telegram-assistant-agent-or-throw';
import { startTelegramTyping } from 'src/logic-functions/utils/start-telegram-typing';

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
}): Promise<'ANSWERED' | 'FAILED' | 'STILL_RUNNING' | 'SKIPPED'> => {
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

  const request = { client, botToken, chatId, requestId };
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
      requestId,
      requestText,
      history,
      workspaceMemberId,
      workspaceBaseUrl,
      deadlineAtMs: agentDeadlineAtMs,
    });

    await deliverTelegramAssistantAnswer({
      ...request,
      responseText,
      workspaceBaseUrl,
      deadlineAtMs: deliveryDeadlineAtMs,
    });

    return 'ANSWERED';
  } catch (error) {
    if (
      error instanceof TelegramAssistantDeadlineError &&
      (await keepWaitingForTelegramAssistantAnswer(request))
    ) {
      return 'STILL_RUNNING';
    }

    await failTelegramAssistantRequest({ ...request, error });

    return 'FAILED';
  } finally {
    stopTyping();
  }
};
