import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';

export const claimSlackAssistantRequest = async (
  client: CoreApiClient,
  { id }: { id: string },
): Promise<boolean> => {
  const mutationResult = await client.mutation({
    updateSlackAssistantRequests: {
      __args: {
        data: { status: SLACK_ASSISTANT_REQUEST_STATUS.PROCESSING },
        filter: {
          id: { eq: id },
          status: { eq: SLACK_ASSISTANT_REQUEST_STATUS.PENDING },
        },
      },
      id: true,
    },
  });

  return (mutationResult.updateSlackAssistantRequests?.length ?? 0) > 0;
};
