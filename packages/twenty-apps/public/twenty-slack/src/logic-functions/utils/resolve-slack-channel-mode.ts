import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  SLACK_CHANNEL_MODE,
  type SlackChannelMode,
} from 'src/logic-functions/constants/slack-channel-mode';
import { findSlackChannelRule } from 'src/logic-functions/data/find-slack-channel-rule';

const SLACK_CHANNEL_MODES: SlackChannelMode[] = [
  SLACK_CHANNEL_MODE.OPEN,
  SLACK_CHANNEL_MODE.READ_ONLY,
  SLACK_CHANNEL_MODE.SILENT,
];

// Channels without a rule are open, so the assistant works out of the box.
export const resolveSlackChannelMode = async (
  client: CoreApiClient,
  { slackChannelId }: { slackChannelId: string },
): Promise<SlackChannelMode> => {
  const rule = await findSlackChannelRule(client, { slackChannelId });

  if (rule === undefined || !SLACK_CHANNEL_MODES.includes(rule.mode)) {
    return SLACK_CHANNEL_MODE.OPEN;
  }

  return rule.mode;
};
