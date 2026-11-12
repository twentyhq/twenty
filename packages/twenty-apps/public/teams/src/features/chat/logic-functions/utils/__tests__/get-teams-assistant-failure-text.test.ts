import { describe, expect, it } from 'vitest';

import { TEAMS_ASSISTANT_DEADLINE_ERROR } from 'src/features/chat/logic-functions/constants/teams-assistant-deadline-error';
import { TEAMS_ASSISTANT_DEADLINE_FAILURE_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-deadline-failure-text';
import { TEAMS_ASSISTANT_EMPTY_RESPONSE_ERROR } from 'src/features/chat/logic-functions/constants/teams-assistant-empty-response-error';
import { TEAMS_ASSISTANT_EMPTY_RESPONSE_FAILURE_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-empty-response-failure-text';
import { TEAMS_ASSISTANT_FAILURE_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-failure-text';
import { getTeamsAssistantFailureText } from 'src/features/chat/logic-functions/utils/get-teams-assistant-failure-text';

describe('getTeamsAssistantFailureText', () => {
  it.each([
    [TEAMS_ASSISTANT_DEADLINE_ERROR, TEAMS_ASSISTANT_DEADLINE_FAILURE_TEXT],
    [
      TEAMS_ASSISTANT_EMPTY_RESPONSE_ERROR,
      TEAMS_ASSISTANT_EMPTY_RESPONSE_FAILURE_TEXT,
    ],
    ['Bot Connector POST failed: 500', TEAMS_ASSISTANT_FAILURE_TEXT],
  ])('should map %j to the reply the member sees', (errorMessage, text) => {
    expect(getTeamsAssistantFailureText(errorMessage)).toBe(text);
  });
});
