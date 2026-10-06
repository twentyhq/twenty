import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackAssistantRequestStatus } from 'src/logic-functions/types/slack-assistant-request-status.type';

export const updateSlackAssistantRequest = async (
  client: CoreApiClient,
  {
    id,
    status,
    responseText,
    errorMessage,
    workspaceMemberId,
  }: {
    id: string;
    status?: SlackAssistantRequestStatus;
    responseText?: string;
    errorMessage?: string;
    workspaceMemberId?: string;
  },
): Promise<void> => {
  await client.mutation({
    updateSlackAssistantRequest: {
      __args: {
        id,
        data: {
          ...(isDefined(status) ? { status } : {}),
          ...(isDefined(responseText) ? { responseText } : {}),
          ...(isDefined(errorMessage) ? { errorMessage } : {}),
          ...(isDefined(workspaceMemberId) ? { workspaceMemberId } : {}),
        },
      },
      id: true,
    },
  });
};
