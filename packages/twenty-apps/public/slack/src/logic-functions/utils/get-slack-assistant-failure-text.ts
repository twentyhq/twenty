import { SLACK_ASSISTANT_DEADLINE_ERROR } from 'src/logic-functions/constants/slack-assistant-deadline-error';
import { SLACK_ASSISTANT_DEADLINE_FAILURE_TEXT } from 'src/logic-functions/constants/slack-assistant-deadline-failure-text';
import { SLACK_ASSISTANT_EMPTY_RESPONSE_ERROR } from 'src/logic-functions/constants/slack-assistant-empty-response-error';
import { SLACK_ASSISTANT_EMPTY_RESPONSE_FAILURE_TEXT } from 'src/logic-functions/constants/slack-assistant-empty-response-failure-text';
import { SLACK_ASSISTANT_FAILURE_TEXT } from 'src/logic-functions/constants/slack-assistant-failure-text';

// Unmapped failures stay generic so no internal error text reaches Slack.
export const getSlackAssistantFailureText = (errorMessage: string): string => {
  if (errorMessage === SLACK_ASSISTANT_DEADLINE_ERROR) {
    return SLACK_ASSISTANT_DEADLINE_FAILURE_TEXT;
  }

  if (errorMessage === SLACK_ASSISTANT_EMPTY_RESPONSE_ERROR) {
    return SLACK_ASSISTANT_EMPTY_RESPONSE_FAILURE_TEXT;
  }

  return SLACK_ASSISTANT_FAILURE_TEXT;
};
