import { SLACK_CHANNEL_RULE_MODE } from 'src/logic-functions/constants/slack-channel-rule-mode';
import { type SlackChannelRuleMode } from 'src/logic-functions/types/slack-channel-rule-mode.type';

export const isSlackChannelRuleMode = (
  value: unknown,
): value is SlackChannelRuleMode =>
  Object.values(SLACK_CHANNEL_RULE_MODE).some((mode) => mode === value);
