import { TEAMS_ASSISTANT_DEADLINE_ERROR } from 'src/features/chat/logic-functions/constants/teams-assistant-deadline-error';
import { TEAMS_ASSISTANT_DEADLINE_FAILURE_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-deadline-failure-text';
import { TEAMS_ASSISTANT_EMPTY_RESPONSE_ERROR } from 'src/features/chat/logic-functions/constants/teams-assistant-empty-response-error';
import { TEAMS_ASSISTANT_EMPTY_RESPONSE_FAILURE_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-empty-response-failure-text';
import { TEAMS_ASSISTANT_FAILURE_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-failure-text';

// Unmapped failures stay generic so no internal error text reaches Teams.
export const getTeamsAssistantFailureText = (errorMessage: string): string => {
  if (errorMessage === TEAMS_ASSISTANT_DEADLINE_ERROR) {
    return TEAMS_ASSISTANT_DEADLINE_FAILURE_TEXT;
  }

  if (errorMessage === TEAMS_ASSISTANT_EMPTY_RESPONSE_ERROR) {
    return TEAMS_ASSISTANT_EMPTY_RESPONSE_FAILURE_TEXT;
  }

  return TEAMS_ASSISTANT_FAILURE_TEXT;
};
