import { type SlackChannelRuleMode } from 'src/logic-functions/types/slack-channel-rule-mode.type';

export type SlackSetChannelRuleInput = {
  slackChannelId: string;
  mode: SlackChannelRuleMode;
  name?: string;
};
