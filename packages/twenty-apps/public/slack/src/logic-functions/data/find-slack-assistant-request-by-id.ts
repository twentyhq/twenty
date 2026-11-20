import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackAssistantRequestRecord } from 'src/logic-functions/types/slack-assistant-request-record.type';

export const findSlackAssistantRequestById = async (
  client: CoreApiClient,
  requestId: string,
): Promise<SlackAssistantRequestRecord | undefined> => {
  const queryResult = await client.query({
    slackAssistantRequests: {
      __args: { filter: { id: { eq: requestId } }, first: 1 },
      edges: {
        node: {
          id: true,
          status: true,
          slackChannelId: true,
          slackThreadTimestamp: true,
          slackMessageTimestamp: true,
          updatedAt: true,
        },
      },
    },
  });

  return queryResult.slackAssistantRequests?.edges?.[0]?.node ?? undefined;
};
