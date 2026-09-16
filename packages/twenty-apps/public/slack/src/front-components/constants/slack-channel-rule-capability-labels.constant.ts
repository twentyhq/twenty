import { SLACK_CHANNEL_RULE_CAPABILITY } from 'src/logic-functions/constants/slack-channel-rule-capability';
import { type SlackChannelRuleCapability } from 'src/logic-functions/types/slack-channel-rule-capability.type';

export const SLACK_CHANNEL_RULE_CAPABILITY_LABELS: Record<
  SlackChannelRuleCapability,
  string
> = {
  [SLACK_CHANNEL_RULE_CAPABILITY.FULL]: 'Full',
  [SLACK_CHANNEL_RULE_CAPABILITY.READ_ONLY]: 'Read-only',
};
