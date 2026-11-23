import { type CalendarEventComposerRecurrence } from '@/activities/calendar/types/CalendarEventComposerRecurrence';
import {
  CalendarEventRecurrenceFrequency,
  type CalendarEventRecurrenceInput,
} from '~/generated-metadata/graphql';

export const getCalendarEventRecurrenceInput = (
  recurrence: CalendarEventComposerRecurrence,
): CalendarEventRecurrenceInput => ({
  frequency: recurrence.frequency,
  interval: recurrence.interval,
  daysOfWeek:
    recurrence.frequency === CalendarEventRecurrenceFrequency.WEEKLY
      ? recurrence.additionalDaysOfWeek
      : undefined,
  endDate:
    recurrence.endCondition === 'ON_DATE' ? recurrence.endDate : undefined,
  occurrenceCount:
    recurrence.endCondition === 'AFTER_OCCURRENCE_COUNT'
      ? recurrence.occurrenceCount
      : undefined,
});
