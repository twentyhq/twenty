import { describe, expect, it } from 'vitest';

import { buildSlackAssistantAnswerText } from 'src/logic-functions/utils/build-slack-assistant-answer-text';

describe('buildSlackAssistantAnswerText', () => {
  it('should append the formatted duration to the response', () => {
    const text = buildSlackAssistantAnswerText({
      responseText: 'ACME has 3 open opportunities.',
      durationMilliseconds: 4200,
    });

    expect(text).toBe('ACME has 3 open opportunities.\n\n_Answered in 4s_');
  });

  it('should keep the response body untouched', () => {
    const responseText = '**bold**\n- item';

    expect(
      buildSlackAssistantAnswerText({
        responseText,
        durationMilliseconds: 1000,
      }),
    ).toContain(responseText);
  });
});
