import { type CalendarEventRecurrenceEnd } from '@/activities/calendar/types/CalendarEventRecurrenceEnd';
import {
  type CalendarEventRecurrenceFrequency,
  type CalendarEventRecurrenceWeekday,
} from '~/generated-metadata/graphql';

export type CalendarEventComposerRecurrence = {
  frequency: CalendarEventRecurrenceFrequency;
  interval: number;
  daysOfWeek: CalendarEventRecurrenceWeekday[];
  end: CalendarEventRecurrenceEnd;
};
