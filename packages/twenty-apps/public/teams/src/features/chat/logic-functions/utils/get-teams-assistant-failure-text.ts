import { TEAMS_ASSISTANT_DEADLINE_FAILURE_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-deadline-failure-text';
import { TEAMS_ASSISTANT_EMPTY_RESPONSE_FAILURE_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-empty-response-failure-text';
import { TEAMS_ASSISTANT_FAILURE_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-failure-text';
import { TeamsAssistantDeadlineError } from 'src/features/chat/logic-functions/types/teams-assistant-deadline-error';
import { TeamsAssistantEmptyResponseError } from 'src/features/chat/logic-functions/types/teams-assistant-empty-response-error';

export const getTeamsAssistantFailureText = (error: unknown): string => {
  if (error instanceof TeamsAssistantDeadlineError) {
    return TEAMS_ASSISTANT_DEADLINE_FAILURE_TEXT;
  }

  if (error instanceof TeamsAssistantEmptyResponseError) {
    return TEAMS_ASSISTANT_EMPTY_RESPONSE_FAILURE_TEXT;
  }

  return TEAMS_ASSISTANT_FAILURE_TEXT;
};
