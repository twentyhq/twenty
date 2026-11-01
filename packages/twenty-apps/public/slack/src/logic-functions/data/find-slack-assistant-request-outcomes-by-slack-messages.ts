import { isNonEmptyString, isString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackAssistantRequestOutcome } from 'src/logic-functions/types/slack-assistant-request-outcome.type';
import { isSlackAssistantRequestStatus } from 'src/logic-functions/utils/is-slack-assistant-request-status';

export const findSlackAssistantRequestOutcomesBySlackMessages = async (
  client: CoreApiClient,
  {
    slackChannelId,
    slackMessageTimestamps,
  }: { slackChannelId: string; slackMessageTimestamps: string[] },
): Promise<Map<string, SlackAssistantRequestOutcome>> => {
  const outcomeByMessageTimestamp = new Map<
    string,
    SlackAssistantRequestOutcome
  >();

  if (slackMessageTimestamps.length === 0) {
    return outcomeByMessageTimestamp;
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
          responseText: true,
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
      outcomeByMessageTimestamp.set(node.slackMessageTimestamp, {
        status: node.status,
        responseText: isString(node.responseText) ? node.responseText : null,
      });
    }
  }

  return outcomeByMessageTimestamp;
};
