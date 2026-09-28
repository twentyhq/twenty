import { type SlackChannelRuleMode } from 'src/logic-functions/types/slack-channel-rule-mode.type';

export type SlackChannelRule = {
  id: string;
  name: string | undefined;
  slackChannelId: string;
  slackTeamId: string | undefined;
  mode: SlackChannelRuleMode;
};
