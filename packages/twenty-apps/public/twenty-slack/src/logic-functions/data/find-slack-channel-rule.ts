import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackChannelMode } from 'src/logic-functions/constants/slack-channel-mode';

export const findSlackChannelRule = async (
  client: CoreApiClient,
  { slackChannelId }: { slackChannelId: string },
): Promise<{ mode: SlackChannelMode } | undefined> => {
  const queryResult = await client.query({
    slackChannelRules: {
      __args: {
        filter: { slackChannelId: { eq: slackChannelId } },
        first: 1,
      },
      edges: { node: { mode: true } },
    },
  });

  const mode = queryResult.slackChannelRules?.edges?.[0]?.node?.mode;

  return mode ? { mode: mode as SlackChannelMode } : undefined;
};
