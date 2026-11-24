import { type CalendarEventComposerRecurrence } from '@/activities/calendar/types/CalendarEventComposerRecurrence';
import { isDefined } from 'twenty-shared/utils';
import { type CalendarEventRecurrenceInput } from '~/generated-metadata/graphql';

export const getCalendarEventRecurrenceInput = (
  recurrence: CalendarEventComposerRecurrence | null,
): CalendarEventRecurrenceInput | undefined => {
  if (!isDefined(recurrence)) {
    return undefined;
  }

  const { end, ...repeatRule } = recurrence;

  switch (end.type) {
    case 'NEVER':
      return repeatRule;
    case 'ON_DATE':
      return { ...repeatRule, endDate: end.endDate };
    case 'AFTER_OCCURRENCE_COUNT':
      return { ...repeatRule, endOccurrenceCount: end.occurrenceCount };
  }
};
