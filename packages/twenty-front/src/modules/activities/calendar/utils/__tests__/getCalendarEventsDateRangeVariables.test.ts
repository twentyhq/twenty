import { Temporal } from 'temporal-polyfill';
import { FirstDayOfTheWeek } from 'twenty-shared/types';

import { getCalendarEventsDateRangeVariables } from '@/activities/calendar/utils/getCalendarEventsDateRangeVariables';

// Wednesday 25 March 2026 in Paris, four days before the switch to summer time
const NOW = Temporal.ZonedDateTime.from(
  '2026-03-25T14:30:00+01:00[Europe/Paris]',
);

describe('getCalendarEventsDateRangeVariables', () => {
  it('returns no bounds for all time', () => {
    expect(
      getCalendarEventsDateRangeVariables({
        preset: 'ALL',
        customDateRange: {},
        now: NOW,
        firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      }),
    ).toEqual({});
  });

  it('covers the whole current day in the user timezone', () => {
    expect(
      getCalendarEventsDateRangeVariables({
        preset: 'TODAY',
        customDateRange: {},
        now: NOW,
        firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      }),
    ).toEqual({
      startsAtFrom: '2026-03-24T23:00:00Z',
      startsAtBefore: '2026-03-25T23:00:00Z',
    });
  });

  it.each([
    {
      firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      startsAtFrom: '2026-03-22T23:00:00Z',
      startsAtBefore: '2026-03-29T22:00:00Z',
    },
    {
      firstDayOfTheWeek: FirstDayOfTheWeek.SUNDAY,
      startsAtFrom: '2026-03-21T23:00:00Z',
      startsAtBefore: '2026-03-28T23:00:00Z',
    },
  ])(
    'starts this week on the user first day of the week ($firstDayOfTheWeek)',
    ({ firstDayOfTheWeek, startsAtFrom, startsAtBefore }) => {
      expect(
        getCalendarEventsDateRangeVariables({
          preset: 'THIS_WEEK',
          customDateRange: {},
          now: NOW,
          firstDayOfTheWeek,
        }),
      ).toEqual({ startsAtFrom, startsAtBefore });
    },
  );

  it('covers the whole current month', () => {
    expect(
      getCalendarEventsDateRangeVariables({
        preset: 'THIS_MONTH',
        customDateRange: {},
        now: NOW,
        firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      }),
    ).toEqual({
      startsAtFrom: '2026-02-28T23:00:00Z',
      startsAtBefore: '2026-03-31T22:00:00Z',
    });
  });

  it('covers whole days of a custom range, end day included', () => {
    expect(
      getCalendarEventsDateRangeVariables({
        preset: 'CUSTOM',
        customDateRange: {
          startPlainDate: '2026-03-01',
          endPlainDate: '2026-03-31',
        },
        now: NOW,
        firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      }),
    ).toEqual({
      startsAtFrom: '2026-02-28T23:00:00Z',
      startsAtBefore: '2026-03-31T22:00:00Z',
    });
  });

  it('leaves a custom range open where no day is picked', () => {
    expect(
      getCalendarEventsDateRangeVariables({
        preset: 'CUSTOM',
        customDateRange: { startPlainDate: '2026-03-01' },
        now: NOW,
        firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      }),
    ).toEqual({
      startsAtFrom: '2026-02-28T23:00:00Z',
      startsAtBefore: undefined,
    });
  });
});
