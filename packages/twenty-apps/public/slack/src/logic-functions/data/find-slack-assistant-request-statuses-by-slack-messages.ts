import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackAssistantRequestStatus } from 'src/logic-functions/types/slack-assistant-request-status.type';
import { isSlackAssistantRequestStatus } from 'src/logic-functions/utils/is-slack-assistant-request-status';

export const findSlackAssistantRequestStatusesBySlackMessages = async (
  client: CoreApiClient,
  {
    slackChannelId,
    slackMessageTimestamps,
  }: { slackChannelId: string; slackMessageTimestamps: string[] },
): Promise<Map<string, SlackAssistantRequestStatus>> => {
  const statusByMessageTimestamp = new Map<
    string,
    SlackAssistantRequestStatus
  >();

  if (slackMessageTimestamps.length === 0) {
    return statusByMessageTimestamp;
  }

  const queryResult = await client.query({
    slackAssistantRequests: {
      __args: {
        filter: {
          slackChannelId: { eq: slackChannelId },
          slackMessageTimestamp: { in: slackMessageTimestamps },
        },
        first: slackMessageTimestamps.length,
      },
      edges: {
        node: {
          status: true,
          slackMessageTimestamp: true,
        },
      },
    },
  });

  for (const edge of queryResult.slackAssistantRequests?.edges ?? []) {
    const node = edge?.node;

    if (
      isNonEmptyString(node?.slackMessageTimestamp) &&
      isSlackAssistantRequestStatus(node.status)
    ) {
      statusByMessageTimestamp.set(node.slackMessageTimestamp, node.status);
    }
  }

  return statusByMessageTimestamp;
};
