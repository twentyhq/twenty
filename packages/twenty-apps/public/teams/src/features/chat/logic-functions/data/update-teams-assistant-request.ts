import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type TeamsAssistantRequestStatus } from 'src/features/chat/logic-functions/types/teams-assistant-request-status.type';
import { buildTeamsAssistantRequestName } from 'src/features/chat/logic-functions/utils/build-teams-assistant-request-name';

export const updateTeamsAssistantRequest = async ({
  client,
  id,
  status,
  responseText,
  errorMessage,
  workspaceMemberId,
  requestText,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  id: string;
  status?: TeamsAssistantRequestStatus;
  responseText?: string;
  errorMessage?: string;
  workspaceMemberId?: string;
  requestText?: string;
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
          ...(isDefined(requestText)
            ? {
                name: buildTeamsAssistantRequestName(requestText),
                requestText: { blocknote: null, markdown: requestText },
              }
            : {}),
        },
      },
      id: true,
    },
  });
};
