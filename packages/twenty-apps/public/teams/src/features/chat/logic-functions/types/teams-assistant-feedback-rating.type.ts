import { type TEAMS_ASSISTANT_FEEDBACK_RATING } from 'src/features/chat/logic-functions/constants/teams-assistant-feedback-rating';

export type TeamsAssistantFeedbackRating =
  (typeof TEAMS_ASSISTANT_FEEDBACK_RATING)[keyof typeof TEAMS_ASSISTANT_FEEDBACK_RATING];
