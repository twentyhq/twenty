import { describe, expect, it } from 'vitest';

import { formatSlackUnfurlSelectValue } from 'src/logic-functions/utils/format-slack-unfurl-select-value';

describe('formatSlackUnfurlSelectValue', () => {
  it('should humanize snake case option values', () => {
    expect(formatSlackUnfurlSelectValue('MEETING_SCHEDULED')).toBe(
      'Meeting scheduled',
    );
    expect(formatSlackUnfurlSelectValue('NEW')).toBe('New');
    expect(formatSlackUnfurlSelectValue('IN_PROGRESS')).toBe('In progress');
  });

  it('should return undefined for empty values', () => {
    expect(formatSlackUnfurlSelectValue('')).toBeUndefined();
    expect(formatSlackUnfurlSelectValue('___')).toBeUndefined();
  });
});
