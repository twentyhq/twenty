import { createContext } from 'react';

import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';

type CalendarContextValue = {
  calendarEventsByDayTime: Record<number, CalendarEvent[] | undefined>;
  currentCalendarEvent?: CalendarEvent;
  displayCurrentEventCursor?: boolean;
  getNextCalendarEvent: (
    calendarEvent: CalendarEvent,
  ) => CalendarEvent | undefined;
  updateCurrentCalendarEvent: () => void;
};

export const CalendarContext = createContext<CalendarContextValue>({
  calendarEventsByDayTime: {},
  getNextCalendarEvent: () => undefined,
  updateCurrentCalendarEvent: () => {},
});
