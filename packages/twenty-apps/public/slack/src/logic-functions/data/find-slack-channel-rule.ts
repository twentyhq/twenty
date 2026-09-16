import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_CHANNEL_RULE_CAPABILITY } from 'src/logic-functions/constants/slack-channel-rule-capability';
import { type SlackChannelRule } from 'src/logic-functions/types/slack-channel-rule.type';
import { isSlackChannelRuleCapability } from 'src/logic-functions/utils/is-slack-channel-rule-capability';
import { isSlackChannelRuleMode } from 'src/logic-functions/utils/is-slack-channel-rule-mode';

export const findSlackChannelRule = async (
  client: Pick<CoreApiClient, 'query'>,
  { slackChannelId }: { slackChannelId: string },
): Promise<SlackChannelRule | undefined> => {
  const queryResult = await client.query({
    slackChannelRules: {
      __args: {
        filter: { slackChannelId: { eq: slackChannelId } },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          name: true,
          slackChannelId: true,
          slackTeamId: true,
          mode: true,
          capability: true,
        },
      },
    },
  });

  const node = queryResult.slackChannelRules?.edges?.[0]?.node;

  if (!isNonEmptyString(node?.id)) {
    return undefined;
  }

  if (!isSlackChannelRuleMode(node.mode)) {
    throw new Error(
      `Slack channel rule ${node.id} has an unsupported mode "${node.mode}"`,
    );
  }

  if (
    isNonEmptyString(node.capability) &&
    !isSlackChannelRuleCapability(node.capability)
  ) {
    throw new Error(
      `Slack channel rule ${node.id} has an unsupported capability "${node.capability}"`,
    );
  }

  return {
    id: node.id,
    name: node.name ?? undefined,
    slackChannelId: node.slackChannelId ?? slackChannelId,
    slackTeamId: node.slackTeamId ?? undefined,
    mode: node.mode,
    capability: isSlackChannelRuleCapability(node.capability)
      ? node.capability
      : SLACK_CHANNEL_RULE_CAPABILITY.FULL,
  };
};
