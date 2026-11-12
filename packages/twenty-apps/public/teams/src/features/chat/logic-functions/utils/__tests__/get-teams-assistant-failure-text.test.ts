import { describe, expect, it } from 'vitest';

import { TEAMS_ASSISTANT_DEADLINE_FAILURE_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-deadline-failure-text';
import { TEAMS_ASSISTANT_EMPTY_RESPONSE_FAILURE_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-empty-response-failure-text';
import { TEAMS_ASSISTANT_FAILURE_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-failure-text';
import { TeamsAssistantDeadlineError } from 'src/features/chat/logic-functions/types/teams-assistant-deadline-error';
import { TeamsAssistantEmptyResponseError } from 'src/features/chat/logic-functions/types/teams-assistant-empty-response-error';
import { getTeamsAssistantFailureText } from 'src/features/chat/logic-functions/utils/get-teams-assistant-failure-text';

describe('getTeamsAssistantFailureText', () => {
  it.each([
    [
      new TeamsAssistantDeadlineError('Agent did not answer in time'),
      TEAMS_ASSISTANT_DEADLINE_FAILURE_TEXT,
    ],
    [
      new TeamsAssistantEmptyResponseError('Agent returned an empty response'),
      TEAMS_ASSISTANT_EMPTY_RESPONSE_FAILURE_TEXT,
    ],
    [new Error('Bot Connector POST failed: 500'), TEAMS_ASSISTANT_FAILURE_TEXT],
    ['not an error object', TEAMS_ASSISTANT_FAILURE_TEXT],
  ])('should map %o to the reply the member sees', (error, text) => {
    expect(getTeamsAssistantFailureText(error)).toBe(text);
  });
});
