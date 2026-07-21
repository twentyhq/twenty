import { isUndefined } from '@sniptt/guards';

import { RECONCILE_UPCOMING_CALENDAR_EVENTS_ROUTE_PATH } from 'src/constants/reconcile-upcoming-calendar-events-route-path';
import { postToOwnRoute } from 'src/logic-functions/data/post-to-own-route.util';

export const requestUpcomingCalendarEventsReconciliation = async ({
  calendarEventIds,
}: {
  calendarEventIds?: string[];
} = {}): Promise<boolean> =>
  postToOwnRoute({
    path: RECONCILE_UPCOMING_CALENDAR_EVENTS_ROUTE_PATH,
    body: isUndefined(calendarEventIds) ? {} : { calendarEventIds },
  });
