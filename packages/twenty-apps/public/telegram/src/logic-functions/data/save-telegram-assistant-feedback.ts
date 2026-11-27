import { isNonEmptyArray } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type TelegramAssistantFeedback } from 'src/logic-functions/types/telegram-assistant-feedback.type';

export const saveTelegramAssistantFeedback = async ({
  client,
  id,
  telegramUserId,
  feedback,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  id: string;
  telegramUserId: string;
  feedback: TelegramAssistantFeedback;
}): Promise<boolean> => {
  const mutationResult = await client.mutation({
    updateTelegramAssistantRequests: {
      __args: {
        data: { feedback },
        filter: { id: { eq: id }, telegramUserId: { eq: telegramUserId } },
      },
      id: true,
    },
  });

  return isNonEmptyArray(mutationResult.updateTelegramAssistantRequests);
};
