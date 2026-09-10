import { getCalendarEventComposerDefaultDates } from '@/activities/calendar/utils/getCalendarEventComposerDefaultDates';
import { Temporal } from 'temporal-polyfill';

describe('getCalendarEventComposerDefaultDates', () => {
  it('starts at the next half-hour and lasts one hour', () => {
    expect(
      getCalendarEventComposerDefaultDates({
        now: Temporal.Instant.from('2026-08-23T19:16:47Z'),
        timeZone: 'Europe/Paris',
      }),
    ).toEqual({
      startsAt: '2026-08-23T19:30:00Z',
      endsAt: '2026-08-23T20:30:00Z',
    });
  });

  it('uses the following interval when already on a half-hour boundary', () => {
    expect(
      getCalendarEventComposerDefaultDates({
        now: Temporal.Instant.from('2026-08-23T10:30:00Z'),
        timeZone: 'UTC',
      }),
    ).toEqual({
      startsAt: '2026-08-23T11:00:00Z',
      endsAt: '2026-08-23T12:00:00Z',
    });
  });

  it('rounds safely across a daylight-saving transition', () => {
    expect(
      getCalendarEventComposerDefaultDates({
        now: Temporal.Instant.from('2026-03-29T00:45:00Z'),
        timeZone: 'Europe/Paris',
      }),
    ).toEqual({
      startsAt: '2026-03-29T01:00:00Z',
      endsAt: '2026-03-29T02:00:00Z',
    });
  });
});
