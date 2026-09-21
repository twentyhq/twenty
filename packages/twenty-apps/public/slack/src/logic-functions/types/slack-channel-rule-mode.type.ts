import { type SLACK_CHANNEL_RULE_MODE } from 'src/logic-functions/constants/slack-channel-rule-mode';

export type SlackChannelRuleMode =
  (typeof SLACK_CHANNEL_RULE_MODE)[keyof typeof SLACK_CHANNEL_RULE_MODE];
