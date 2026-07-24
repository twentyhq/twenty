import { type CoreApiClient } from 'twenty-client-sdk/core';

// Slack delivers the same message twice when it is both a mention and a
// subscribed-thread reply, each time under a distinct event_id, so the channel
// and message timestamp are the only stable identity of a request.
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
