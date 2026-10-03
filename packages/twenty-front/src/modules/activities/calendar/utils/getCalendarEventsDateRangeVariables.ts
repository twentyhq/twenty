import { type CalendarEventsCustomDateRange } from '@/activities/calendar/types/CalendarEventsCustomDateRange';
import { type CalendarEventsDateRangePreset } from '@/activities/calendar/types/CalendarEventsDateRangePreset';
import { isNonEmptyString } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';
import { type FirstDayOfTheWeek } from 'twenty-shared/types';
import { getNextPeriodStart, getPeriodStart } from 'twenty-shared/utils';

type CalendarEventsDateRangeVariables = {
  startsAtFrom?: string;
  startsAtBefore?: string;
};

const getPeriodVariables = (
  now: Temporal.ZonedDateTime,
  unit: 'DAY' | 'WEEK' | 'MONTH',
  firstDayOfTheWeek: FirstDayOfTheWeek,
): CalendarEventsDateRangeVariables => ({
  startsAtFrom: getPeriodStart(now, unit, firstDayOfTheWeek)
    .toInstant()
    .toString(),
  startsAtBefore: getNextPeriodStart(now, unit, firstDayOfTheWeek)
    .toInstant()
    .toString(),
});

const getStartOfDayInstant = (
  plainDate: Temporal.PlainDate,
  timeZone: string,
) => plainDate.toZonedDateTime(timeZone).toInstant().toString();

export const getCalendarEventsDateRangeVariables = ({
  preset,
  customDateRange,
  now,
  firstDayOfTheWeek,
}: {
  preset: CalendarEventsDateRangePreset;
  customDateRange: CalendarEventsCustomDateRange;
  now: Temporal.ZonedDateTime;
  firstDayOfTheWeek: FirstDayOfTheWeek;
}): CalendarEventsDateRangeVariables => {
  switch (preset) {
    case 'ALL':
      return {};
    case 'TODAY':
      return getPeriodVariables(now, 'DAY', firstDayOfTheWeek);
    case 'THIS_WEEK':
      return getPeriodVariables(now, 'WEEK', firstDayOfTheWeek);
    case 'THIS_MONTH':
      return getPeriodVariables(now, 'MONTH', firstDayOfTheWeek);
    case 'CUSTOM': {
      const { startPlainDate, endPlainDate } = customDateRange;

      return {
        startsAtFrom: isNonEmptyString(startPlainDate)
          ? getStartOfDayInstant(
              Temporal.PlainDate.from(startPlainDate),
              now.timeZoneId,
            )
          : undefined,
        startsAtBefore: isNonEmptyString(endPlainDate)
          ? getStartOfDayInstant(
              Temporal.PlainDate.from(endPlainDate).add({ days: 1 }),
              now.timeZoneId,
            )
          : undefined,
      };
    }
  }
};
