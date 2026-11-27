import { describe, expect, it } from 'vitest';

import { formatUtcDateTime } from 'src/logic-functions/utils/format-utc-date-time.util';

describe('formatUtcDateTime', () => {
  it('formats the date and time in UTC', () => {
    expect(formatUtcDateTime('2026-11-27T10:05:00.000Z')).toBe(
      'Nov 27, 2026, 10:05 AM UTC',
    );
    expect(formatUtcDateTime('2026-11-27T21:30:00.000+02:00')).toBe(
      'Nov 27, 2026, 7:30 PM UTC',
    );
  });

  it('writes midnight and noon as 12', () => {
    expect(formatUtcDateTime('2026-01-01T00:00:00.000Z')).toBe(
      'Jan 1, 2026, 12:00 AM UTC',
    );
    expect(formatUtcDateTime('2026-01-01T12:00:00.000Z')).toBe(
      'Jan 1, 2026, 12:00 PM UTC',
    );
  });

  it.each([undefined, '', 'not a date'])('returns nothing for %j', (value) => {
    expect(formatUtcDateTime(value)).toBeUndefined();
  });
});
