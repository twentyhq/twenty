import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type TeamsAssistantRequestDraft } from 'src/features/chat/logic-functions/types/teams-assistant-request-draft.type';
import { TEAMS_ASSISTANT_PENDING_REQUEST_NAME } from 'src/features/chat/logic-functions/constants/teams-assistant-pending-request-name';

export const createTeamsAssistantRequest = async ({
  client,
  draft,
}: {
  client: CoreApiClient;
  draft: Omit<TeamsAssistantRequestDraft, 'requestText'>;
}): Promise<string> => {
  const mutationResult = await client.mutation({
    createTeamsAssistantRequest: {
      __args: {
        data: {
          ...draft,
          name: TEAMS_ASSISTANT_PENDING_REQUEST_NAME,
        },
      },
      id: true,
    },
  });

  const requestId = mutationResult.createTeamsAssistantRequest?.id;

  if (!isNonEmptyString(requestId)) {
    throw new Error('createTeamsAssistantRequest did not return an id');
  }

  return requestId;
};
