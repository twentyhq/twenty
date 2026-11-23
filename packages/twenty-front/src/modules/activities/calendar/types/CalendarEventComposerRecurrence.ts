import { type CalendarEventRecurrenceEndCondition } from '@/activities/calendar/types/CalendarEventRecurrenceEndCondition';
import {
  type CalendarEventRecurrenceFrequency,
  type CalendarEventRecurrenceWeekday,
} from '~/generated-metadata/graphql';

export type CalendarEventComposerRecurrence = {
  frequency: CalendarEventRecurrenceFrequency;
  interval: number;
  additionalDaysOfWeek: CalendarEventRecurrenceWeekday[];
  endCondition: CalendarEventRecurrenceEndCondition;
  endDate: string;
  occurrenceCount: number;
};
