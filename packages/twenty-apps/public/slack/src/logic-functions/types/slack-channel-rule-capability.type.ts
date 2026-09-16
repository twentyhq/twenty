import { type SLACK_CHANNEL_RULE_CAPABILITY } from 'src/logic-functions/constants/slack-channel-rule-capability';

export type SlackChannelRuleCapability =
  (typeof SLACK_CHANNEL_RULE_CAPABILITY)[keyof typeof SLACK_CHANNEL_RULE_CAPABILITY];
