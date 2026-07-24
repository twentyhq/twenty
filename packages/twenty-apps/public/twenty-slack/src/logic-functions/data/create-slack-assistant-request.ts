import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackAssistantRequestDraft } from 'src/logic-functions/types/slack-event.type';
import { buildSlackAssistantRequestName } from 'src/logic-functions/utils/build-slack-assistant-request-name';

export const createSlackAssistantRequest = async (
  client: CoreApiClient,
  draft: SlackAssistantRequestDraft,
): Promise<string> => {
  const mutationResult = await client.mutation({
    createSlackAssistantRequest: {
      __args: {
        data: {
          name: buildSlackAssistantRequestName(draft.requestText),
          ...draft,
        },
      },
      id: true,
    },
  });

  const requestId = mutationResult.createSlackAssistantRequest?.id;

  if (!isNonEmptyString(requestId)) {
    throw new Error('createSlackAssistantRequest did not return an id');
  }

  return requestId;
};
