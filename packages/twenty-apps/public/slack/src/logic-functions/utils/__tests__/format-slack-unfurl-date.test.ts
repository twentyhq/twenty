import { describe, expect, it } from 'vitest';

import { formatSlackUnfurlDate } from 'src/logic-functions/utils/format-slack-unfurl-date';

describe('formatSlackUnfurlDate', () => {
  it('should format iso dates compactly', () => {
    expect(formatSlackUnfurlDate('2026-03-14')).toBe('Mar 14, 2026');
    expect(formatSlackUnfurlDate('2026-03-14T10:30:00.000Z')).toBe(
      'Mar 14, 2026',
    );
  });

  it('should return undefined for invalid dates', () => {
    expect(formatSlackUnfurlDate('not-a-date')).toBeUndefined();
  });
});
