import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RECONCILE_UPCOMING_CALENDAR_EVENTS_ROUTE_PATH } from 'src/constants/reconcile-upcoming-calendar-events-route-path';
import { requestUpcomingCalendarEventsReconciliation } from 'src/logic-functions/data/request-upcoming-calendar-events-reconciliation.util';

const fetchMock = vi.fn();

describe('requestUpcomingCalendarEventsReconciliation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('TWENTY_FUNCTIONS_URL', 'https://acme.functions.example.com');
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'app-access-token');
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('posts an empty body to start a full sweep', async () => {
    const result = await requestUpcomingCalendarEventsReconciliation();

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchMock.mock.calls[0];
    expect(requestUrl).toBe(
      `https://acme.functions.example.com${RECONCILE_UPCOMING_CALENDAR_EVENTS_ROUTE_PATH}`,
    );
    expect(requestInit.method).toBe('POST');
    expect(requestInit.body).toBe(JSON.stringify({}));
  });

  it('posts the remaining calendar event ids to continue a sweep', async () => {
    await requestUpcomingCalendarEventsReconciliation({
      calendarEventIds: ['calendar-event-1', 'calendar-event-2'],
    });

    const [requestUrl, requestInit] = fetchMock.mock.calls[0];
    expect(requestUrl).toBe(
      `https://acme.functions.example.com${RECONCILE_UPCOMING_CALENDAR_EVENTS_ROUTE_PATH}`,
    );
    expect(requestInit.body).toBe(
      JSON.stringify({
        calendarEventIds: ['calendar-event-1', 'calendar-event-2'],
      }),
    );
  });

  it('reports a kickoff that failed to fire', async () => {
    fetchMock.mockRejectedValue(new Error('Network failed'));

    await expect(requestUpcomingCalendarEventsReconciliation()).resolves.toBe(
      false,
    );
  });
});
