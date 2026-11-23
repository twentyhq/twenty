import { type CalendarEventComposerRecurrence } from '@/activities/calendar/types/CalendarEventComposerRecurrence';
import { isDefined } from 'twenty-shared/utils';
import {
  CalendarEventRecurrenceFrequency,
  type CalendarEventRecurrenceInput,
} from '~/generated-metadata/graphql';

export const getCalendarEventRecurrenceInput = (
  recurrence: CalendarEventComposerRecurrence | null,
): CalendarEventRecurrenceInput | undefined => {
  if (!isDefined(recurrence)) {
    return undefined;
  }

  const isWeekly =
    recurrence.frequency === CalendarEventRecurrenceFrequency.WEEKLY;
  const endsOnDate = recurrence.endCondition === 'ON_DATE';
  const endsAfterOccurrenceCount =
    recurrence.endCondition === 'AFTER_OCCURRENCE_COUNT';

  return {
    frequency: recurrence.frequency,
    interval: recurrence.interval,
    daysOfWeek: isWeekly ? recurrence.additionalDaysOfWeek : undefined,
    endDate: endsOnDate ? recurrence.endDate : undefined,
    occurrenceCount: endsAfterOccurrenceCount
      ? recurrence.occurrenceCount
      : undefined,
  };
};
