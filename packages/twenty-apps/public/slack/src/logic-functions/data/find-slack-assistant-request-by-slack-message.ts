import { type CoreApiClient } from 'twenty-client-sdk/core';

export const findSlackAssistantRequestBySlackMessage = async (
  client: CoreApiClient,
  {
    slackChannelId,
    slackMessageTimestamp,
  }: { slackChannelId: string; slackMessageTimestamp: string },
): Promise<string | undefined> => {
  const queryResult = await client.query({
    slackAssistantRequests: {
      __args: {
        filter: {
          slackChannelId: { eq: slackChannelId },
          slackMessageTimestamp: { eq: slackMessageTimestamp },
        },
        first: 1,
      },
      edges: { node: { id: true } },
    },
  });

  return queryResult.slackAssistantRequests?.edges?.[0]?.node?.id ?? undefined;
};
