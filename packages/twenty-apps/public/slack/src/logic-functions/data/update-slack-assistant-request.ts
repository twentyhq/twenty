import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';

type SlackAssistantRequestStatus =
  (typeof SLACK_ASSISTANT_REQUEST_STATUS)[keyof typeof SLACK_ASSISTANT_REQUEST_STATUS];

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
