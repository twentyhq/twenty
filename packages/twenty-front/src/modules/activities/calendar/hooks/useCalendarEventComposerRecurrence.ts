import { CALENDAR_EVENT_RECURRENCE_DEFAULT_OCCURRENCE_COUNT } from '@/activities/calendar/constants/CalendarEventRecurrenceDefaultOccurrenceCount';
import { type CalendarEventComposerRecurrence } from '@/activities/calendar/types/CalendarEventComposerRecurrence';
import { type CalendarEventRecurrenceEnd } from '@/activities/calendar/types/CalendarEventRecurrenceEnd';
import { getCalendarEventRecurrenceDefaultEndDate } from '@/activities/calendar/utils/getCalendarEventRecurrenceDefaultEndDate';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type CalendarEventRecurrenceFrequency } from '~/generated-metadata/graphql';

export const useCalendarEventComposerRecurrence = ({
  startDateInTimeZone,
}: {
  startDateInTimeZone: string;
}) => {
  const [recurrence, setRecurrence] =
    useState<CalendarEventComposerRecurrence | null>(null);

  const recurrenceEnd = recurrence?.end;
  const hasValidRecurrenceEndDate =
    recurrenceEnd?.type !== 'ON_DATE' ||
    recurrenceEnd.endDate >= startDateInTimeZone;

  const handleRecurrenceFrequencyChange = (
    frequency: CalendarEventRecurrenceFrequency | null,
  ) => {
    if (!isDefined(frequency)) {
      setRecurrence(null);

      return;
    }

    setRecurrence((currentRecurrence) => ({
      frequency,
      interval: 1,
      daysOfWeek: currentRecurrence?.daysOfWeek ?? [],
      end: currentRecurrence?.end ?? { type: 'NEVER' },
    }));
  };

  const updateRecurrence = (
    recurrenceUpdate: Partial<CalendarEventComposerRecurrence>,
  ) => {
    setRecurrence((currentRecurrence) => {
      if (!isDefined(currentRecurrence)) {
        return currentRecurrence;
      }

      return { ...currentRecurrence, ...recurrenceUpdate };
    });
  };

  const handleRecurrenceEndTypeChange = (
    endType: CalendarEventRecurrenceEnd['type'],
  ) => {
    if (!isDefined(recurrence) || recurrence.end.type === endType) {
      return;
    }

    switch (endType) {
      case 'NEVER':
        updateRecurrence({ end: { type: 'NEVER' } });

        return;
      case 'ON_DATE': {
        const defaultEndDate = getCalendarEventRecurrenceDefaultEndDate({
          frequency: recurrence.frequency,
          interval: recurrence.interval,
          startDateInTimeZone,
        });

        updateRecurrence({ end: { type: 'ON_DATE', endDate: defaultEndDate } });

        return;
      }
      case 'AFTER_OCCURRENCE_COUNT':
        updateRecurrence({
          end: {
            type: 'AFTER_OCCURRENCE_COUNT',
            occurrenceCount: CALENDAR_EVENT_RECURRENCE_DEFAULT_OCCURRENCE_COUNT,
          },
        });

        return;
    }
  };

  return {
    recurrence,
    hasValidRecurrenceEndDate,
    handleRecurrenceFrequencyChange,
    handleRecurrenceEndTypeChange,
    updateRecurrence,
  };
};
