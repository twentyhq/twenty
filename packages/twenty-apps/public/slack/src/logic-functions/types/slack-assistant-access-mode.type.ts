import { type SLACK_ASSISTANT_ACCESS_MODE } from 'src/logic-functions/constants/slack-assistant-access-mode';

export type SlackAssistantAccessMode =
  (typeof SLACK_ASSISTANT_ACCESS_MODE)[keyof typeof SLACK_ASSISTANT_ACCESS_MODE];
