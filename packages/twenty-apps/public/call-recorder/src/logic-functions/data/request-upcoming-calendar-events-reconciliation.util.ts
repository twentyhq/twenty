import { isUndefined } from '@sniptt/guards';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { RECONCILE_UPCOMING_CALENDAR_EVENTS_ROUTE_PATH } from 'src/constants/reconcile-upcoming-calendar-events-route-path';

const RECONCILIATION_KICKOFF_FLUSH_MS = 5_000;

export const requestUpcomingCalendarEventsReconciliation = async ({
  calendarEventIds,
}: {
  calendarEventIds?: string[];
} = {}): Promise<boolean> => {
  const client = new RestApiClient();

  try {
    await client.post(
      `/s${RECONCILE_UPCOMING_CALENDAR_EVENTS_ROUTE_PATH}`,
      isUndefined(calendarEventIds) ? {} : { calendarEventIds },
      { signal: AbortSignal.timeout(RECONCILIATION_KICKOFF_FLUSH_MS) },
    );

    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === 'TimeoutError' || error.name === 'AbortError')
    ) {
      return true;
    }

    if (process.env.NODE_ENV !== 'test') {
      console.error(
        `[call-recorder] upcoming calendar event reconciliation failed to fire: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return false;
  }
};
