import { type SlackChannelRuleCapability } from 'src/logic-functions/types/slack-channel-rule-capability.type';
import { type SlackChannelRuleMode } from 'src/logic-functions/types/slack-channel-rule-mode.type';

export type SlackSetChannelRuleInput = {
  slackChannelId: string;
  mode: SlackChannelRuleMode;
  capability?: SlackChannelRuleCapability;
  name?: string;
};
