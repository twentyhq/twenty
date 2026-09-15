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

export const SLACK_CHANNEL_RULE_MODE_DESCRIPTIONS: Record<
  SlackChannelRuleMode,
  string
> = {
  [SLACK_CHANNEL_RULE_MODE.OPEN]:
    'Anyone in the channel can use the assistant, even when the workspace is restricted.',
  [SLACK_CHANNEL_RULE_MODE.LINKED_MEMBERS_ONLY]:
    'Only Slack accounts linked to a workspace member get an answer. Others are asked to have an admin link them.',
  [SLACK_CHANNEL_RULE_MODE.SILENT]:
    'The assistant ignores the channel: no reply, no thinking status, nothing recorded.',
};

export const SLACK_CHANNEL_RULE_MODE_ORDER: SlackChannelRuleMode[] = [
  SLACK_CHANNEL_RULE_MODE.OPEN,
  SLACK_CHANNEL_RULE_MODE.LINKED_MEMBERS_ONLY,
  SLACK_CHANNEL_RULE_MODE.SILENT,
];
