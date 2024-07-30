import { createContext } from 'react';

import { TimelineCalendarEvent } from '~/generated/graphql';

type CalendarContextValue = {
  calendarEventsByDayTime: Record<number, TimelineCalendarEvent[] | undefined>;
  currentCalendarEvent?: TimelineCalendarEvent;
  displayCurrentEventCursor?: boolean;
  getNextCalendarEvent: (
    calendarEvent: TimelineCalendarEvent,
  ) => TimelineCalendarEvent | undefined;
  updateCurrentCalendarEvent: () => void;
};

export const CalendarContext = createContext<CalendarContextValue>({
  calendarEventsByDayTime: {},
  getNextCalendarEvent: () => undefined,
  updateCurrentCalendarEvent: () => {},
});
