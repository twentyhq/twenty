import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RECONCILE_UPCOMING_CALENDAR_EVENTS_ROUTE_PATH } from 'src/constants/reconcile-upcoming-calendar-events-route-path';
import { requestUpcomingCalendarEventsReconciliation } from 'src/logic-functions/data/request-upcoming-calendar-events-reconciliation.util';

const postToOwnRouteMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/data/post-to-own-route.util', () => ({
  postToOwnRoute: postToOwnRouteMock,
}));

describe('requestUpcomingCalendarEventsReconciliation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    postToOwnRouteMock.mockResolvedValue(true);
  });

  it('posts an empty body to start a full sweep', async () => {
    const result = await requestUpcomingCalendarEventsReconciliation();

    expect(result).toBe(true);
    expect(postToOwnRouteMock).toHaveBeenCalledWith({
      path: RECONCILE_UPCOMING_CALENDAR_EVENTS_ROUTE_PATH,
      body: {},
    });
  });

  it('posts the remaining calendar event ids to continue a sweep', async () => {
    await requestUpcomingCalendarEventsReconciliation({
      calendarEventIds: ['calendar-event-1', 'calendar-event-2'],
    });

    expect(postToOwnRouteMock).toHaveBeenCalledWith({
      path: RECONCILE_UPCOMING_CALENDAR_EVENTS_ROUTE_PATH,
      body: { calendarEventIds: ['calendar-event-1', 'calendar-event-2'] },
    });
  });

  it('reports a kickoff that failed to fire', async () => {
    postToOwnRouteMock.mockResolvedValue(false);

    await expect(requestUpcomingCalendarEventsReconciliation()).resolves.toBe(
      false,
    );
  });
});
