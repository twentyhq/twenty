import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackAssistantRequestStatus } from 'src/logic-functions/types/slack-assistant-request-status.type';

export const updateSlackAssistantRequest = async (
  client: CoreApiClient,
  {
    id,
    status,
    responseText,
    errorMessage,
  }: {
    id: string;
    status: SlackAssistantRequestStatus;
    responseText?: string;
    errorMessage?: string;
  },
): Promise<void> => {
  await client.mutation({
    updateSlackAssistantRequest: {
      __args: {
        id,
        data: {
          status,
          ...(responseText !== undefined ? { responseText } : {}),
          ...(errorMessage !== undefined ? { errorMessage } : {}),
        },
      },
      id: true,
    },
  });
};
