import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/sweep-upcoming-calendar-events-logic-function-universal-identifier';
import { UPCOMING_CALENDAR_EVENTS_SWEEP_CRON_PATTERN } from 'src/logic-functions/constants/upcoming-calendar-events-sweep-cron-pattern';
import {
  enqueueReconcileCalendarEventsBatches,
  type EnqueueReconcileCalendarEventsBatchesResult,
} from 'src/logic-functions/data/enqueue-reconcile-calendar-events-batches.util';
import { fetchUpcomingCalendarEventIds } from 'src/logic-functions/data/fetch-upcoming-calendar-event-ids.util';

type SweepUpcomingCalendarEventsResult =
  | { outcome: 'nothing-to-reconcile' }
  | ({
      outcome: 'batches-enqueued';
    } & EnqueueReconcileCalendarEventsBatchesResult);

export const sweepUpcomingCalendarEventsHandler =
  async (): Promise<SweepUpcomingCalendarEventsResult> => {
    const client = new CoreApiClient();

    const calendarEventIds = await fetchUpcomingCalendarEventIds(
      client,
      new Date(),
    );

    if (calendarEventIds.length === 0) {
      return { outcome: 'nothing-to-reconcile' };
    }

    const result = await enqueueReconcileCalendarEventsBatches({
      calendarEventIds,
    });

    return { outcome: 'batches-enqueued', ...result };
  };

export default defineLogicFunction({
  universalIdentifier:
    SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'sweep-upcoming-calendar-events',
  description:
    'Discovers upcoming calendar events on a schedule and enqueues one reconciliation job per batch so meetings entering the scheduling horizon get their recording bots.',
  timeoutSeconds: 250,
  handler: sweepUpcomingCalendarEventsHandler,
  cronTriggerSettings: {
    pattern: UPCOMING_CALENDAR_EVENTS_SWEEP_CRON_PATTERN,
  },
});
