import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackAssistantRequestDraft } from 'src/logic-functions/types/slack-event.type';
import { buildSlackAssistantRequestName } from 'src/logic-functions/utils/build-slack-assistant-request-name';

export const createSlackAssistantRequest = async (
  client: CoreApiClient,
  draft: SlackAssistantRequestDraft,
): Promise<string | undefined> => {
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

  return mutationResult.createSlackAssistantRequest?.id ?? undefined;
};
