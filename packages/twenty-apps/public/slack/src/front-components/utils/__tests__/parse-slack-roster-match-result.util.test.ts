import { describe, expect, it } from 'vitest';

import { parseSlackRosterMatchResult } from 'src/front-components/utils/parse-slack-roster-match-result.util';

const FALLBACK_MESSAGE = 'Could not match Slack users. Please try again.';

describe('parseSlackRosterMatchResult', () => {
  it('should parse a successful match summary', () => {
    const result = parseSlackRosterMatchResult({
      value: {
        success: true,
        message: 'Matched 2 Slack users by email.',
        linkedCount: 2,
        alreadyLinkedCount: 1,
        unmatchedCount: 3,
        failedCount: 1,
      },
      fallbackMessage: FALLBACK_MESSAGE,
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Matched 2 Slack users by email.');
    expect(result.linkedCount).toBe(2);
    expect(result.unmatchedCount).toBe(3);
    expect(result.failedCount).toBe(1);
  });

  it('should default counts to zero when missing', () => {
    const result = parseSlackRosterMatchResult({
      value: { success: true, message: 'ok' },
      fallbackMessage: FALLBACK_MESSAGE,
    });

    expect(result.linkedCount).toBe(0);
    expect(result.unmatchedCount).toBe(0);
    expect(result.failedCount).toBe(0);
  });

  it('should ignore non-numeric counts', () => {
    const result = parseSlackRosterMatchResult({
      value: {
        success: true,
        message: 'ok',
        linkedCount: 'two',
        unmatchedCount: null,
      },
      fallbackMessage: FALLBACK_MESSAGE,
    });

    expect(result.linkedCount).toBe(0);
    expect(result.unmatchedCount).toBe(0);
  });

  it('should fall back on a malformed payload', () => {
    const result = parseSlackRosterMatchResult({
      value: undefined,
      fallbackMessage: FALLBACK_MESSAGE,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe(FALLBACK_MESSAGE);
    expect(result.linkedCount).toBe(0);
    expect(result.unmatchedCount).toBe(0);
  });
});
