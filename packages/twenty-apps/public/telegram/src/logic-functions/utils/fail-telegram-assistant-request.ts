import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TELEGRAM_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/telegram-assistant-request-status';
import { updateTelegramAssistantRequest } from 'src/logic-functions/data/update-telegram-assistant-request';
import { getTelegramAssistantFailureText } from 'src/logic-functions/utils/get-telegram-assistant-failure-text';
import { sendTelegramMessage } from 'src/logic-functions/utils/send-telegram-message';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message';

export const failTelegramAssistantRequest = async ({
  client,
  botToken,
  chatId,
  requestId,
  error,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  botToken: string;
  chatId: number;
  requestId: string;
  error: unknown;
}): Promise<void> => {
  console.error('[telegram] could not answer the request', error);

  await updateTelegramAssistantRequest({
    client,
    id: requestId,
    status: TELEGRAM_ASSISTANT_REQUEST_STATUS.FAILED,
    errorMessage: toErrorMessage(error),
  }).catch((updateError: unknown) => {
    console.error('[telegram] could not mark the request failed', updateError);
  });
  await sendTelegramMessage({
    botToken,
    chatId,
    text: getTelegramAssistantFailureText(error),
  }).catch((sendError: unknown) => {
    console.error('[telegram] could not send the failure reply', sendError);
  });
};
