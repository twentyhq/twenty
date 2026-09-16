import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_CHANNEL_RULE_MODE } from 'src/logic-functions/constants/slack-channel-rule-mode';
import { findSlackChannelRule } from 'src/logic-functions/data/find-slack-channel-rule';

export const isSlackChannelSilenced = async ({
  client,
  slackChannelId,
}: {
  client: Pick<CoreApiClient, 'query'>;
  slackChannelId: string;
}): Promise<boolean> => {
  const rule = await findSlackChannelRule(client, { slackChannelId });

  return rule?.mode === SLACK_CHANNEL_RULE_MODE.SILENT;
};
