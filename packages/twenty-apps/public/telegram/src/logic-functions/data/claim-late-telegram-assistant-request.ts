import { isNonEmptyArray } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TELEGRAM_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/telegram-assistant-request-status';

export const claimLateTelegramAssistantRequest = async ({
  client,
  id,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  id: string;
}): Promise<boolean> => {
  const mutationResult = await client.mutation({
    updateTelegramAssistantRequests: {
      __args: {
        data: { status: TELEGRAM_ASSISTANT_REQUEST_STATUS.PROCESSING },
        filter: {
          id: { eq: id },
          status: { eq: TELEGRAM_ASSISTANT_REQUEST_STATUS.STILL_RUNNING },
        },
      },
      id: true,
    },
  });

  return isNonEmptyArray(mutationResult.updateTelegramAssistantRequests);
};
