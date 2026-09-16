import { SLACK_CHANNEL_RULE_CAPABILITY } from 'src/logic-functions/constants/slack-channel-rule-capability';
import { type SlackChannelRuleCapability } from 'src/logic-functions/types/slack-channel-rule-capability.type';

export const SLACK_CHANNEL_RULE_CAPABILITY_LABELS: Record<
  SlackChannelRuleCapability,
  string
> = {
  [SLACK_CHANNEL_RULE_CAPABILITY.FULL]: 'Full',
  [SLACK_CHANNEL_RULE_CAPABILITY.READ_ONLY]: 'Read-only',
};

export const SLACK_CHANNEL_RULE_CAPABILITY_DESCRIPTIONS: Record<
  SlackChannelRuleCapability,
  string
> = {
  [SLACK_CHANNEL_RULE_CAPABILITY.FULL]:
    'The assistant can read and change records, within what the requester is allowed to do.',
  [SLACK_CHANNEL_RULE_CAPABILITY.READ_ONLY]:
    'The assistant can only read records in this channel, never create, update or delete them.',
};

export const SLACK_CHANNEL_RULE_CAPABILITY_ORDER: SlackChannelRuleCapability[] =
  [SLACK_CHANNEL_RULE_CAPABILITY.FULL, SLACK_CHANNEL_RULE_CAPABILITY.READ_ONLY];
