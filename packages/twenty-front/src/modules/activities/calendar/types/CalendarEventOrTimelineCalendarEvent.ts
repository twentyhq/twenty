import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';

export type CalendarEventGeneric = Omit<
  CalendarEvent,
  'attendees' | 'externalCreatedAt'
>;
