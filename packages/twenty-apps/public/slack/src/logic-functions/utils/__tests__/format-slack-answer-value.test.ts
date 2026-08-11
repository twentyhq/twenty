import { describe, expect, it } from 'vitest';

import { formatSlackAnswerValue } from 'src/logic-functions/utils/format-slack-answer-value';

describe('formatSlackAnswerValue', () => {
  it('should turn an ISO date into a native Slack date token', () => {
    expect(formatSlackAnswerValue('2026-08-15')).toBe(
      '<!date^1786752000^{date_short_pretty}|2026-08-15>',
    );
  });

  it('should turn an ISO timestamp into a native Slack date token', () => {
    expect(formatSlackAnswerValue('2026-08-15T12:00:00.000Z')).toBe(
      '<!date^1786795200^{date_short_pretty}|2026-08-15>',
    );
  });

  it('should leave non-date values untouched', () => {
    expect(formatSlackAnswerValue('Proposal')).toBe('Proposal');
    expect(formatSlackAnswerValue('$12,500')).toBe('$12,500');
  });

  it('should leave date-shaped but unparseable values untouched', () => {
    expect(formatSlackAnswerValue('2026-13-45')).toBe('2026-13-45');
  });
});
