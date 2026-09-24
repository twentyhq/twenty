import { describe, expect, it } from 'vitest';

import { SLACK_ASSISTANT_DEADLINE_ERROR } from 'src/logic-functions/constants/slack-assistant-deadline-error';
import { SLACK_ASSISTANT_DEADLINE_FAILURE_TEXT } from 'src/logic-functions/constants/slack-assistant-deadline-failure-text';
import { SLACK_ASSISTANT_EMPTY_RESPONSE_ERROR } from 'src/logic-functions/constants/slack-assistant-empty-response-error';
import { SLACK_ASSISTANT_EMPTY_RESPONSE_FAILURE_TEXT } from 'src/logic-functions/constants/slack-assistant-empty-response-failure-text';
import { SLACK_ASSISTANT_FAILURE_TEXT } from 'src/logic-functions/constants/slack-assistant-failure-text';
import { getSlackAssistantFailureText } from 'src/logic-functions/utils/get-slack-assistant-failure-text';

describe('getSlackAssistantFailureText', () => {
  it('should tell the member to narrow the request when the answer deadline passed', () => {
    expect(getSlackAssistantFailureText(SLACK_ASSISTANT_DEADLINE_ERROR)).toBe(
      SLACK_ASSISTANT_DEADLINE_FAILURE_TEXT,
    );
  });

  it('should invite the member to ask again when the agent answered with nothing', () => {
    expect(
      getSlackAssistantFailureText(SLACK_ASSISTANT_EMPTY_RESPONSE_ERROR),
    ).toBe(SLACK_ASSISTANT_EMPTY_RESPONSE_FAILURE_TEXT);
  });

  it('should point at an admin for a failure the member cannot act on', () => {
    expect(getSlackAssistantFailureText('Agent is not available')).toBe(
      SLACK_ASSISTANT_FAILURE_TEXT,
    );
  });

  it('should never surface the underlying error to the member', () => {
    const errorMessage =
      'Could not deliver Slack answer: channel_not_found at postMessage()';

    expect(getSlackAssistantFailureText(errorMessage)).toBe(
      SLACK_ASSISTANT_FAILURE_TEXT,
    );
  });
});
