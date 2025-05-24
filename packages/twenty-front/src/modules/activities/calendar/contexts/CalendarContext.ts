import { createContext } from 'react';

import { TimelineCalendarEvent } from '~/generated/graphql';

type CalendarContextValue = {
  calendarEventsByDayTime: Record<number, TimelineCalendarEvent[] | undefined>;
};

export const CalendarContext = createContext<CalendarContextValue>({
  calendarEventsByDayTime: {},
});
