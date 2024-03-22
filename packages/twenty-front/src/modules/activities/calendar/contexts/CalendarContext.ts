import { createContext } from 'react';

import { CalendarEventOrTimelineCalendarEvent } from '@/activities/calendar/types/CalendarEventOrTimelineCalendarEvent';

type CalendarContextValue = {
  calendarEventsByDayTime: Record<
    number,
    CalendarEventOrTimelineCalendarEvent[] | undefined
  >;
  currentCalendarEvent?: CalendarEventOrTimelineCalendarEvent;
  displayCurrentEventCursor?: boolean;
  getNextCalendarEvent: (
    calendarEvent: CalendarEventOrTimelineCalendarEvent,
  ) => CalendarEventOrTimelineCalendarEvent | undefined;
  updateCurrentCalendarEvent: () => void;
};

export const CalendarContext = createContext<CalendarContextValue>({
  calendarEventsByDayTime: {},
  getNextCalendarEvent: () => undefined,
  updateCurrentCalendarEvent: () => {},
});
