import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type TeamsAssistantRequestStatus } from 'src/features/chat/logic-functions/types/teams-assistant-request-status.type';

export const updateTeamsAssistantRequest = async ({
  client,
  id,
  status,
  responseText,
  errorMessage,
  workspaceMemberId,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  id: string;
  status?: TeamsAssistantRequestStatus;
  responseText?: string;
  errorMessage?: string;
  workspaceMemberId?: string;
}): Promise<void> => {
  await client.mutation({
    updateTeamsAssistantRequest: {
      __args: {
        id,
        data: {
          ...(isDefined(status) ? { status } : {}),
          ...(isDefined(responseText)
            ? { responseText: { blocknote: null, markdown: responseText } }
            : {}),
          ...(isDefined(errorMessage) ? { errorMessage } : {}),
          ...(isDefined(workspaceMemberId) ? { workspaceMemberId } : {}),
        },
      },
      id: true,
    },
  });
};
