import { describe, expect, it } from 'vitest';

import { formatSlackRecordDate } from 'src/logic-functions/utils/format-slack-record-date';

describe('formatSlackRecordDate', () => {
  it('should drop the year for dates in the current year', () => {
    const currentYear = new Date().getUTCFullYear();

    expect(formatSlackRecordDate(`${currentYear}-01-05T09:00:00.000Z`)).toBe(
      'Jan 5',
    );
  });

  it('should keep the year for dates outside the current year', () => {
    expect(formatSlackRecordDate('2020-01-05T09:00:00.000Z')).toBe(
      'Jan 5, 2020',
    );
  });

  it('should return nothing for an empty or unparsable value', () => {
    expect(formatSlackRecordDate(null)).toBeUndefined();
    expect(formatSlackRecordDate('not a date')).toBeUndefined();
  });
});
