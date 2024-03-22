import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { TimelineCalendarEvent } from '~/generated/graphql';

export type CalendarEventOrTimelineCalendarEvent =
  | CalendarEvent
  | TimelineCalendarEvent;
