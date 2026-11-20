import { isNonEmptyArray } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { getSlackAssistantRequestLeaseCutoff } from 'src/logic-functions/utils/get-slack-assistant-request-lease-cutoff';

export const failStaleSlackAssistantRequest = async (
  client: CoreApiClient,
  { id, errorMessage }: { id: string; errorMessage: string },
): Promise<boolean> => {
  const mutationResult = await client.mutation({
    updateSlackAssistantRequests: {
      __args: {
        data: { status: SLACK_ASSISTANT_REQUEST_STATUS.FAILED, errorMessage },
        filter: {
          and: [
            { id: { eq: id } },
            {
              status: {
                in: [
                  SLACK_ASSISTANT_REQUEST_STATUS.PENDING,
                  SLACK_ASSISTANT_REQUEST_STATUS.PROCESSING,
                ],
              },
            },
            {
              updatedAt: {
                lt: getSlackAssistantRequestLeaseCutoff().toISOString(),
              },
            },
          ],
        },
      },
      id: true,
    },
  });

  return isNonEmptyArray(mutationResult.updateSlackAssistantRequests);
};
