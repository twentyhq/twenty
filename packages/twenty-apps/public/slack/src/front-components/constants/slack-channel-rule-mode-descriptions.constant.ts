import { SLACK_CHANNEL_RULE_MODE } from 'src/logic-functions/constants/slack-channel-rule-mode';
import { type SlackChannelRuleMode } from 'src/logic-functions/types/slack-channel-rule-mode.type';

export const SLACK_CHANNEL_RULE_MODE_DESCRIPTIONS: Record<
  SlackChannelRuleMode,
  string
> = {
  [SLACK_CHANNEL_RULE_MODE.OPEN]:
    'Anyone in the channel can use the assistant, even when the workspace is restricted.',
  [SLACK_CHANNEL_RULE_MODE.LINKED_MEMBERS_ONLY]:
    'Only Slack accounts linked to a workspace member get an answer. Others are asked to have an admin link them.',
  [SLACK_CHANNEL_RULE_MODE.SILENT]:
    'The assistant ignores the channel: no thinking status, nothing recorded. Whoever mentions it gets a private note that it is silenced there.',
};
