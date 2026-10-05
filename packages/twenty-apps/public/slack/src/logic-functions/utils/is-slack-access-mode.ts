import { SLACK_ACCESS_MODE } from 'src/logic-functions/constants/slack-access-mode';
import { type SlackAccessMode } from 'src/logic-functions/types/slack-access-mode.type';

export const isSlackAccessMode = (value: unknown): value is SlackAccessMode =>
  value === SLACK_ACCESS_MODE.ANYONE ||
  value === SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS;
