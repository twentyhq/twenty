import { SLACK_CHANNEL_RULE_MODE } from 'src/logic-functions/constants/slack-channel-rule-mode';
import { type SlackChannelRuleMode } from 'src/logic-functions/types/slack-channel-rule-mode.type';

export const SLACK_CHANNEL_RULE_MODE_LABELS: Record<
  SlackChannelRuleMode,
  string
> = {
  [SLACK_CHANNEL_RULE_MODE.OPEN]: 'Open to anyone',
  [SLACK_CHANNEL_RULE_MODE.LINKED_MEMBERS_ONLY]: 'Linked members only',
  [SLACK_CHANNEL_RULE_MODE.SILENT]: 'Silent',
};
