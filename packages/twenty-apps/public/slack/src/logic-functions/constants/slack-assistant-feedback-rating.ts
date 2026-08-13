export const SLACK_ASSISTANT_FEEDBACK_RATING = {
  POSITIVE: 'POSITIVE',
  NEGATIVE: 'NEGATIVE',
} as const;

export type SlackAssistantFeedbackRating =
  (typeof SLACK_ASSISTANT_FEEDBACK_RATING)[keyof typeof SLACK_ASSISTANT_FEEDBACK_RATING];
