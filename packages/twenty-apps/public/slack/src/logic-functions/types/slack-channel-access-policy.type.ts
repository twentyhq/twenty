import { type SlackAccessMode } from 'src/logic-functions/types/slack-access-mode.type';
import { type SlackChannelRuleCapability } from 'src/logic-functions/types/slack-channel-rule-capability.type';

export type SlackChannelAccessPolicy =
  | { status: 'SILENT' }
  | {
      status: 'ANSWER';
      accessMode: SlackAccessMode;
      capability: SlackChannelRuleCapability;
      isChannelRule: boolean;
    }
  | { status: 'UNREADABLE' };
