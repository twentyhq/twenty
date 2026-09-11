import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackAssistantRequestRecord } from 'src/logic-functions/types/slack-assistant-request-record.type';

export const findSlackAssistantRequestBySlackMessage = async (
  client: CoreApiClient,
  {
    slackChannelId,
    slackMessageTimestamp,
  }: { slackChannelId: string; slackMessageTimestamp: string },
): Promise<SlackAssistantRequestRecord | undefined> => {
  const queryResult = await client.query({
    slackAssistantRequests: {
      __args: {
        filter: {
          slackChannelId: { eq: slackChannelId },
          slackMessageTimestamp: { eq: slackMessageTimestamp },
        },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          status: true,
          slackChannelId: true,
          slackChannelType: true,
          slackThreadTimestamp: true,
          slackMessageTimestamp: true,
          slackUserId: true,
          requestText: true,
          updatedAt: true,
        },
      },
    },
  });

  return queryResult.slackAssistantRequests?.edges?.[0]?.node ?? undefined;
};
