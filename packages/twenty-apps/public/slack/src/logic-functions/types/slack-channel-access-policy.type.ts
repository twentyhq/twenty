import { type SlackAccessMode } from 'src/logic-functions/types/slack-access-mode.type';

export type SlackChannelAccessPolicy =
  | { status: 'SILENT' }
  | { status: 'ANSWER'; accessMode: SlackAccessMode; isChannelRule: boolean }
  | { status: 'UNREADABLE' };
