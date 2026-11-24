import { isNonEmptyArray } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { fetchUpcomingCalendarEvents } from 'src/logic-functions/data/fetch-upcoming-calendar-events.util';
import { reconcileCallRecorderForCalendarEventIds } from 'src/logic-functions/flows/reconcile-call-recorder.util';
import { type UpcomingCalendarEventsReconciliationResult } from 'src/logic-functions/types/upcoming-calendar-events-reconciliation-result.type';

export const reconcileCallRecorderForUpcomingCalendarEventIds = async ({
  client,
  calendarEventIds,
}: {
  client: CoreApiClient;
  calendarEventIds: string[];
}): Promise<UpcomingCalendarEventsReconciliationResult> => {
  if (!isNonEmptyArray(calendarEventIds)) {
    return { skipped: true, reason: 'no calendar event' };
  }

  const upcomingCalendarEventIds = new Set(
    (await fetchUpcomingCalendarEvents(client, new Date())).map(
      (upcomingCalendarEvent) => upcomingCalendarEvent.id,
    ),
  );
  const upcomingChangedCalendarEventIds = calendarEventIds.filter(
    (calendarEventId) => upcomingCalendarEventIds.has(calendarEventId),
  );

  if (!isNonEmptyArray(upcomingChangedCalendarEventIds)) {
    return { skipped: true, reason: 'no upcoming calendar event' };
  }

  return {
    reconciled: true,
    calendarEventIds: upcomingChangedCalendarEventIds,
    reconciliationResults: await reconcileCallRecorderForCalendarEventIds({
      client,
      calendarEventIds: upcomingChangedCalendarEventIds,
    }),
  };
};
