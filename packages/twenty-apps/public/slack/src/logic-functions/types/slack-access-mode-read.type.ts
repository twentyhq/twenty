import { type SlackAccessMode } from 'src/logic-functions/constants/slack-access-mode';

export type SlackAccessModeRead =
  | { status: 'READ'; accessMode: SlackAccessMode }
  | { status: 'UNREADABLE' };
