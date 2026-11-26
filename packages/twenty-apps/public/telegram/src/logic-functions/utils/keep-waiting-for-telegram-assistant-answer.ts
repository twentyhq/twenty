import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TELEGRAM_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/telegram-assistant-request-status';
import { TELEGRAM_ASSISTANT_STILL_RUNNING_TEXT } from 'src/logic-functions/constants/telegram-assistant-still-running-text';
import { TELEGRAM_LATE_ANSWER_GIVE_UP_AFTER_MS } from 'src/logic-functions/constants/telegram-late-answer-give-up-after-ms';
import { updateTelegramAssistantRequest } from 'src/logic-functions/data/update-telegram-assistant-request';
import { enqueueTelegramLateAnswer } from 'src/logic-functions/utils/enqueue-telegram-late-answer';
import { sendTelegramMessage } from 'src/logic-functions/utils/send-telegram-message';

export const keepWaitingForTelegramAssistantAnswer = async ({
  client,
  botToken,
  chatId,
  requestId,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  botToken: string;
  chatId: number;
  requestId: string;
}): Promise<boolean> => {
  try {
    await updateTelegramAssistantRequest({
      client,
      id: requestId,
      status: TELEGRAM_ASSISTANT_REQUEST_STATUS.STILL_RUNNING,
    });
    await enqueueTelegramLateAnswer({
      requestId,
      chatId,
      giveUpAtMs: Date.now() + TELEGRAM_LATE_ANSWER_GIVE_UP_AFTER_MS,
    });
  } catch (error) {
    console.error('[telegram] could not keep waiting for the answer', error);

    return false;
  }

  await sendTelegramMessage({
    botToken,
    chatId,
    text: TELEGRAM_ASSISTANT_STILL_RUNNING_TEXT,
  }).catch((sendError: unknown) => {
    console.warn('[telegram] could not send the still running note', sendError);
  });

  return true;
};
