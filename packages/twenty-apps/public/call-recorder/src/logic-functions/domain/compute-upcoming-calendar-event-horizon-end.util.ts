import { UPCOMING_CALENDAR_EVENT_SCHEDULING_HORIZON_DAYS } from 'src/logic-functions/constants/upcoming-calendar-event-scheduling-horizon-days';

export const computeUpcomingCalendarEventHorizonEnd = (now: Date): Date => {
  const horizonEnd = new Date(now);

  horizonEnd.setDate(
    horizonEnd.getDate() + UPCOMING_CALENDAR_EVENT_SCHEDULING_HORIZON_DAYS,
  );

  return horizonEnd;
};
