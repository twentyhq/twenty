import { describe, expect, it } from 'vitest';

import { formatMeetingTimeRange } from 'src/front-components/utils/format-meeting-time-range.util';

const STARTS_AT = '2026-11-27T12:00:00.000Z';
const ENDS_AT = '2026-11-27T12:45:00.000Z';

describe('formatMeetingTimeRange', () => {
  it('shows the day and the start and end times', () => {
    const timeRange = formatMeetingTimeRange({
      startsAt: STARTS_AT,
      endsAt: ENDS_AT,
      locale: 'en-US',
    });
    const startOnly = formatMeetingTimeRange({
      startsAt: STARTS_AT,
      endsAt: undefined,
      locale: 'en-US',
    });

    expect(timeRange).toContain('Nov 27');
    expect(timeRange).not.toBe(startOnly);
  });

  it.each([undefined, null, 'not a date', '2026-11-27T11:00:00.000Z'])(
    'shows the start alone when the end is %j',
    (endsAt) => {
      expect(
        formatMeetingTimeRange({
          startsAt: STARTS_AT,
          endsAt,
          locale: 'en-US',
        }),
      ).toBe(
        formatMeetingTimeRange({
          startsAt: STARTS_AT,
          endsAt: undefined,
          locale: 'en-US',
        }),
      );
    },
  );

  it.each([undefined, null, '', 'not a date'])(
    'returns nothing when the start is %j',
    (startsAt) => {
      expect(
        formatMeetingTimeRange({ startsAt, endsAt: ENDS_AT, locale: 'en-US' }),
      ).toBeUndefined();
    },
  );

  it('does not throw on a locale the runtime rejects', () => {
    expect(
      formatMeetingTimeRange({
        startsAt: STARTS_AT,
        endsAt: ENDS_AT,
        locale: 'not_a_locale!',
      }),
    ).toEqual(expect.any(String));
  });
});
