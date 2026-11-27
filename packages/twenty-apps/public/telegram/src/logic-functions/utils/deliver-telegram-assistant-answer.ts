import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TELEGRAM_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/telegram-assistant-request-status';
import { TELEGRAM_PLAIN_MESSAGE_MAX_LENGTH } from 'src/logic-functions/constants/telegram-plain-message-max-length';
import { TELEGRAM_RICH_MESSAGE_MAX_LENGTH } from 'src/logic-functions/constants/telegram-rich-message-max-length';
import { updateTelegramAssistantRequest } from 'src/logic-functions/data/update-telegram-assistant-request';
import { buildTelegramAssistantAnswerText } from 'src/logic-functions/utils/build-telegram-assistant-answer-text';
import { buildTelegramFeedbackKeyboard } from 'src/logic-functions/utils/build-telegram-feedback-keyboard';
import { sendTelegramAnswer } from 'src/logic-functions/utils/send-telegram-answer';

export const deliverTelegramAssistantAnswer = async ({
  client,
  botToken,
  chatId,
  requestId,
  responseText,
  workspaceBaseUrl,
  deadlineAtMs,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  botToken: string;
  chatId: number;
  requestId: string;
  responseText: string;
  workspaceBaseUrl: string | undefined;
  deadlineAtMs: number;
}): Promise<void> => {
  const answer = { responseText, requestId, workspaceBaseUrl };

  await sendTelegramAnswer({
    botToken,
    chatId,
    deadlineAtMs,
    replyMarkup: buildTelegramFeedbackKeyboard(requestId),
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
};
