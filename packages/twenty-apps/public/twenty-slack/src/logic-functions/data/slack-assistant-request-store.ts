import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackAssistantRequestStatus } from 'src/logic-functions/constants/slack-assistant-request-status';
import { type SlackAssistantRequestDraft } from 'src/logic-functions/types/slack-event.type';

const NAME_PREVIEW_MAX_LENGTH = 60;

const buildRequestName = (requestText: string): string =>
  requestText.length > NAME_PREVIEW_MAX_LENGTH
    ? `${requestText.slice(0, NAME_PREVIEW_MAX_LENGTH - 1)}…`
    : requestText;

export const findSlackAssistantRequestByEventId = async (
  client: CoreApiClient,
  slackEventId: string,
): Promise<string | undefined> => {
  const queryResult = await client.query({
    slackAssistantRequests: {
      __args: {
        filter: { slackEventId: { eq: slackEventId } },
        first: 1,
      },
      edges: { node: { id: true } },
    },
  });

  return queryResult.slackAssistantRequests?.edges?.[0]?.node?.id ?? undefined;
};

export const createSlackAssistantRequest = async (
  client: CoreApiClient,
  draft: SlackAssistantRequestDraft,
): Promise<string | undefined> => {
  const mutationResult = await client.mutation({
    createSlackAssistantRequest: {
      __args: {
        data: {
          name: buildRequestName(draft.requestText),
          ...draft,
        },
      },
      id: true,
    },
  });

  return mutationResult.createSlackAssistantRequest?.id ?? undefined;
};

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
