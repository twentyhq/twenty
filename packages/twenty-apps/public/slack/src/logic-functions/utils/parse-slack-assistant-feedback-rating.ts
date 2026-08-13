import { SLACK_ASSISTANT_FEEDBACK_BUTTON_VALUE } from 'src/logic-functions/constants/slack-assistant-feedback-button-value';
import {
  SLACK_ASSISTANT_FEEDBACK_RATING,
  type SlackAssistantFeedbackRating,
} from 'src/logic-functions/constants/slack-assistant-feedback-rating';

export const parseSlackAssistantFeedbackRating = (
  buttonValue: string | undefined,
): SlackAssistantFeedbackRating | undefined => {
  switch (buttonValue) {
    case SLACK_ASSISTANT_FEEDBACK_BUTTON_VALUE.POSITIVE:
      return SLACK_ASSISTANT_FEEDBACK_RATING.POSITIVE;
    case SLACK_ASSISTANT_FEEDBACK_BUTTON_VALUE.NEGATIVE:
      return SLACK_ASSISTANT_FEEDBACK_RATING.NEGATIVE;
    default:
      return undefined;
  }
};
