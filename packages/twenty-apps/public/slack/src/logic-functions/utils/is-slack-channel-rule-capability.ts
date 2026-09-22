import { SLACK_CHANNEL_RULE_CAPABILITY } from 'src/logic-functions/constants/slack-channel-rule-capability';
import { type SlackChannelRuleCapability } from 'src/logic-functions/types/slack-channel-rule-capability.type';

export const isSlackChannelRuleCapability = (
  value: unknown,
): value is SlackChannelRuleCapability =>
  Object.values(SLACK_CHANNEL_RULE_CAPABILITY).some(
    (capability) => capability === value,
  );
