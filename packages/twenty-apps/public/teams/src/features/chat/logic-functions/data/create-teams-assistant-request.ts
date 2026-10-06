import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type TeamsAssistantRequestDraft } from 'src/features/chat/logic-functions/types/teams-assistant-request-draft.type';
import { buildTeamsAssistantRequestName } from 'src/features/chat/logic-functions/utils/build-teams-assistant-request-name';

export const createTeamsAssistantRequest = async (
  client: CoreApiClient,
  draft: TeamsAssistantRequestDraft,
): Promise<string> => {
  const mutationResult = await client.mutation({
    createTeamsAssistantRequest: {
      __args: {
        data: {
          ...draft,
          name: buildTeamsAssistantRequestName(draft.requestText),
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
