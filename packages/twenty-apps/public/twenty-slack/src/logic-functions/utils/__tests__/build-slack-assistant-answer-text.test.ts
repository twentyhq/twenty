import { describe, expect, it } from 'vitest';

import { buildSlackAssistantAnswerText } from 'src/logic-functions/utils/build-slack-assistant-answer-text';

describe('buildSlackAssistantAnswerText', () => {
  it('should append how long the answer took', () => {
    expect(
      buildSlackAssistantAnswerText({
        responseText: 'You have 12 open opportunities.',
        durationMilliseconds: 8_000,
      }),
    ).toBe('You have 12 open opportunities.\n\n_Answered in 8s_');
  });
});
