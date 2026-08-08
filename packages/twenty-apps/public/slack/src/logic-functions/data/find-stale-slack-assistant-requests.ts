import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { type StaleSlackAssistantRequest } from 'src/logic-functions/types/stale-slack-assistant-request.type';

type StaleSlackAssistantRequestNode = {
  id?: string | null;
  slackChannelId?: string | null;
  slackThreadTimestamp?: string | null;
  slackMessageTimestamp?: string | null;
};

export const findStaleSlackAssistantRequests = async (
  client: CoreApiClient,
  {
    updatedBefore,
    limit,
  }: {
    updatedBefore: string;
    limit: number;
  },
): Promise<StaleSlackAssistantRequest[]> => {
  const queryResult = await client.query({
    slackAssistantRequests: {
      __args: {
        filter: {
          status: { eq: SLACK_ASSISTANT_REQUEST_STATUS.PROCESSING },
          updatedAt: { lt: updatedBefore },
        },
        first: limit,
      },
      edges: {
        node: {
          id: true,
          slackChannelId: true,
          slackThreadTimestamp: true,
          slackMessageTimestamp: true,
        },
      },
    },
  });

  const edges = (queryResult.slackAssistantRequests?.edges ?? []) as Array<{
    node?: StaleSlackAssistantRequestNode | null;
  } | null>;

  return edges.flatMap((edge) => {
    const node = edge?.node;

    if (!node?.id) {
      return [];
    }

    return [
      {
        id: node.id,
        slackChannelId: node.slackChannelId ?? undefined,
        slackThreadTimestamp: node.slackThreadTimestamp ?? undefined,
        slackMessageTimestamp: node.slackMessageTimestamp ?? undefined,
      },
    ];
  });
};
