import { type SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';

export type SlackAssistantRequestStatus =
  (typeof SLACK_ASSISTANT_REQUEST_STATUS)[keyof typeof SLACK_ASSISTANT_REQUEST_STATUS];
