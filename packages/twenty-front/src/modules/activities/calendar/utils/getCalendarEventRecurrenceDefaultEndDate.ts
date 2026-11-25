import { CALENDAR_EVENT_RECURRENCE_DEFAULT_OCCURRENCE_COUNT } from '@/activities/calendar/constants/CalendarEventRecurrenceDefaultOccurrenceCount';
import { Temporal } from 'temporal-polyfill';
import { CalendarEventRecurrenceFrequency } from '~/generated-metadata/graphql';

export const getCalendarEventRecurrenceDefaultEndDate = ({
  frequency,
  interval,
  startDateInTimeZone,
}: {
  frequency: CalendarEventRecurrenceFrequency;
  interval: number;
  startDateInTimeZone: string;
}) => {
  const periodsUntilLastDefaultOccurrence =
    interval * (CALENDAR_EVENT_RECURRENCE_DEFAULT_OCCURRENCE_COUNT - 1);
  const startDate = Temporal.PlainDate.from(startDateInTimeZone);

  switch (frequency) {
    case CalendarEventRecurrenceFrequency.DAILY:
      return startDate
        .add({ days: periodsUntilLastDefaultOccurrence })
        .toString();
    case CalendarEventRecurrenceFrequency.WEEKLY:
      return startDate
        .add({ weeks: periodsUntilLastDefaultOccurrence })
        .toString();
    case CalendarEventRecurrenceFrequency.MONTHLY:
      return startDate
        .add({ months: periodsUntilLastDefaultOccurrence })
        .toString();
    case CalendarEventRecurrenceFrequency.YEARLY:
      return startDate
        .add({ years: periodsUntilLastDefaultOccurrence })
        .toString();
  }
};
