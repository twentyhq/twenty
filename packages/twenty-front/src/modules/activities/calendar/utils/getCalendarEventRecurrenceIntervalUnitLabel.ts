import { plural } from '@lingui/core/macro';
import { CalendarEventRecurrenceFrequency } from '~/generated-metadata/graphql';

export const getCalendarEventRecurrenceIntervalUnitLabel = ({
  frequency,
  interval,
}: {
  frequency: CalendarEventRecurrenceFrequency;
  interval: number;
}) => {
  switch (frequency) {
    case CalendarEventRecurrenceFrequency.DAILY:
      return plural(interval, { one: 'day', other: 'days' });
    case CalendarEventRecurrenceFrequency.WEEKLY:
      return plural(interval, { one: 'week', other: 'weeks' });
    case CalendarEventRecurrenceFrequency.MONTHLY:
      return plural(interval, { one: 'month', other: 'months' });
    case CalendarEventRecurrenceFrequency.YEARLY:
      return plural(interval, { one: 'year', other: 'years' });
  }
};
