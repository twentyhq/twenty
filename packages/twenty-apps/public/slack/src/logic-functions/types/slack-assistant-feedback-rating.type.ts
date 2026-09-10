import { type SLACK_ASSISTANT_FEEDBACK_RATING } from 'src/logic-functions/constants/slack-assistant-feedback-rating';

export type SlackAssistantFeedbackRating =
  (typeof SLACK_ASSISTANT_FEEDBACK_RATING)[keyof typeof SLACK_ASSISTANT_FEEDBACK_RATING];
