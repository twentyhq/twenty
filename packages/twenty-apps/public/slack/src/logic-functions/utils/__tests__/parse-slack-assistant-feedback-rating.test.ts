import { describe, expect, it } from 'vitest';

import { parseSlackAssistantFeedbackRating } from 'src/logic-functions/utils/parse-slack-assistant-feedback-rating';

describe('parseSlackAssistantFeedbackRating', () => {
  it('should map the positive button value to the POSITIVE rating', () => {
    expect(parseSlackAssistantFeedbackRating('positive_feedback')).toBe(
      'POSITIVE',
    );
  });

  it('should map the negative button value to the NEGATIVE rating', () => {
    expect(parseSlackAssistantFeedbackRating('negative_feedback')).toBe(
      'NEGATIVE',
    );
  });

  it('should return undefined for unknown or missing values', () => {
    expect(parseSlackAssistantFeedbackRating('something-else')).toBeUndefined();
    expect(parseSlackAssistantFeedbackRating(undefined)).toBeUndefined();
  });
});
