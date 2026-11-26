import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { TELEGRAM_LATE_ANSWER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { TELEGRAM_LATE_ANSWER_DELIVERY_BUDGET_SECONDS } from 'src/logic-functions/constants/telegram-late-answer-delivery-budget-seconds';
import { TELEGRAM_LATE_ANSWER_TIMEOUT_SECONDS } from 'src/logic-functions/constants/telegram-late-answer-timeout-seconds';
import { claimLateTelegramAssistantRequest } from 'src/logic-functions/data/claim-late-telegram-assistant-request';
import { TelegramAssistantDeadlineError } from 'src/logic-functions/types/telegram-assistant-deadline-error';
import { type TelegramLateAnswerPayload } from 'src/logic-functions/types/telegram-late-answer-payload.type';
import { deliverTelegramAssistantAnswer } from 'src/logic-functions/utils/deliver-telegram-assistant-answer';
import { enqueueTelegramLateAnswer } from 'src/logic-functions/utils/enqueue-telegram-late-answer';
import { failTelegramAssistantRequest } from 'src/logic-functions/utils/fail-telegram-assistant-request';
import { fetchWorkspaceBaseUrl } from 'src/logic-functions/utils/fetch-workspace-base-url';
import { getTelegramBotCredentialsOrThrow } from 'src/logic-functions/utils/get-telegram-bot-credentials-or-throw';
import { readTelegramAssistantRunOutcome } from 'src/logic-functions/utils/read-telegram-assistant-run-outcome';

export const telegramLateAnswerHandler = async (
  payload: TelegramLateAnswerPayload,
): Promise<{
  outcome: 'ANSWERED' | 'FAILED' | 'STILL_RUNNING' | 'SKIPPED';
}> => {
  const deliveryDeadlineAtMs =
    Date.now() + TELEGRAM_LATE_ANSWER_DELIVERY_BUDGET_SECONDS * 1000;
  const { requestId, chatId, giveUpAtMs } = payload;
  const runOutcome = await readTelegramAssistantRunOutcome(requestId);

  if (runOutcome.status === 'RUNNING' && Date.now() < giveUpAtMs) {
    await enqueueTelegramLateAnswer(payload);

    return { outcome: 'STILL_RUNNING' };
  }

  const client = new CoreApiClient({ runAs: 'application' });

  if (!(await claimLateTelegramAssistantRequest({ client, id: requestId }))) {
    return { outcome: 'SKIPPED' };
  }

  const { botToken } = getTelegramBotCredentialsOrThrow();
  const request = { client, botToken, chatId, requestId };

  if (runOutcome.status !== 'COMPLETED') {
    await failTelegramAssistantRequest({
      ...request,
      error:
        runOutcome.status === 'FAILED'
          ? new Error(runOutcome.errorMessage)
          : new TelegramAssistantDeadlineError(
              'Agent run had no outcome when the wait for it ended',
            ),
    });

    return { outcome: 'FAILED' };
  }

  try {
    await deliverTelegramAssistantAnswer({
      ...request,
      responseText: runOutcome.responseText,
      workspaceBaseUrl: await fetchWorkspaceBaseUrl(),
      deadlineAtMs: deliveryDeadlineAtMs,
    });

    return { outcome: 'ANSWERED' };
  } catch (error) {
    await failTelegramAssistantRequest({ ...request, error });

    return { outcome: 'FAILED' };
  }
};

export default defineLogicFunction({
  universalIdentifier: TELEGRAM_LATE_ANSWER_UNIVERSAL_IDENTIFIER,
  name: 'telegram-late-answer',
  description:
    'Checks on an agent run that outlasted the update handler. Sends its answer or its failure to the Telegram chat once the run has ended, and otherwise schedules itself again until the wait runs out.',
  timeoutSeconds: TELEGRAM_LATE_ANSWER_TIMEOUT_SECONDS,
  handler: telegramLateAnswerHandler,
});
