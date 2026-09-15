import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_CHANNEL_RULE_MODE } from 'src/logic-functions/constants/slack-channel-rule-mode';
import { findSlackChannelRule } from 'src/logic-functions/data/find-slack-channel-rule';

// Errors propagate on purpose: an event handler that fails is retried by
// Slack, which beats answering in a channel an admin may have silenced.
export const isSlackChannelSilenced = async ({
  client,
  slackChannelId,
}: {
  client: CoreApiClient;
  slackChannelId: string;
}): Promise<boolean> => {
  const rule = await findSlackChannelRule(client, { slackChannelId });

  return rule?.mode === SLACK_CHANNEL_RULE_MODE.SILENT;
};
