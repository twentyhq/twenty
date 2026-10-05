import { type SLACK_ACCESS_MODE } from 'src/logic-functions/constants/slack-access-mode';

export type SlackAccessMode =
  (typeof SLACK_ACCESS_MODE)[keyof typeof SLACK_ACCESS_MODE];
