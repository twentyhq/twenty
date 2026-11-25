import { isNonEmptyArray } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TELEGRAM_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/telegram-assistant-request-status';
import { TELEGRAM_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/logic-functions/constants/telegram-assistant-request-timeout-seconds';

export const claimTelegramAssistantRequest = async ({
  client,
  id,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  id: string;
}): Promise<boolean> => {
  const leaseCutoff = new Date(
    Date.now() - TELEGRAM_ASSISTANT_REQUEST_TIMEOUT_SECONDS * 1000,
  ).toISOString();

  const mutationResult = await client.mutation({
    updateTelegramAssistantRequests: {
      __args: {
        data: { status: TELEGRAM_ASSISTANT_REQUEST_STATUS.PROCESSING },
        filter: {
          and: [
            { id: { eq: id } },
            {
              or: [
                { status: { eq: TELEGRAM_ASSISTANT_REQUEST_STATUS.PENDING } },
                {
                  status: {
                    eq: TELEGRAM_ASSISTANT_REQUEST_STATUS.PROCESSING,
                  },
                  updatedAt: { lt: leaseCutoff },
                },
              ],
            },
          ],
        },
      },
      id: true,
    },
  });

  return isNonEmptyArray(mutationResult.updateTelegramAssistantRequests);
};
