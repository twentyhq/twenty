import { type SlackChannelRuleMode } from 'src/logic-functions/types/slack-channel-rule-mode.type';

export type SlackChannelRuleDraft = {
  name: string;
  slackChannelId: string;
  slackTeamId: string;
  mode: SlackChannelRuleMode;
};
