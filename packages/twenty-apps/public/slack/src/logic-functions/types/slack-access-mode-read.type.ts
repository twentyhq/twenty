import { type SlackAccessMode } from 'src/logic-functions/types/slack-access-mode.type';

export type SlackAccessModeRead =
  | { status: 'READ'; accessMode: SlackAccessMode }
  | { status: 'UNREADABLE' };
