import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/sweep-upcoming-calendar-events-logic-function-universal-identifier';
import { UPCOMING_CALENDAR_EVENTS_SWEEP_CRON_PATTERN } from 'src/logic-functions/constants/upcoming-calendar-events-sweep-cron-pattern';
import { fetchUpcomingCalendarEventIds } from 'src/logic-functions/data/fetch-upcoming-calendar-event-ids.util';
import { reconcileUpcomingCalendarEventBatches } from 'src/logic-functions/flows/reconcile-upcoming-calendar-event-batches.util';
import { type ReconcileUpcomingCalendarEventBatchesResult } from 'src/logic-functions/flows/reconcile-upcoming-calendar-event-batches-result.type';

const TIMEOUT_SECONDS = 900;
const CONTINUATION_RESERVE_MS = 30_000;

type SweepUpcomingCalendarEventsResult =
  | { outcome: 'nothing-to-reconcile' }
  | ({ outcome: 'processed' } & ReconcileUpcomingCalendarEventBatchesResult);

export const sweepUpcomingCalendarEventsHandler =
  async (): Promise<SweepUpcomingCalendarEventsResult> => {
    const startedAtMs = Date.now();
    const client = new CoreApiClient();

    const calendarEventIds = await fetchUpcomingCalendarEventIds(
      client,
      new Date(startedAtMs),
    );

    if (calendarEventIds.length === 0) {
      return { outcome: 'nothing-to-reconcile' };
    }

    const result = await reconcileUpcomingCalendarEventBatches({
      client,
      calendarEventIds,
      deadlineAtMs:
        startedAtMs + TIMEOUT_SECONDS * 1000 - CONTINUATION_RESERVE_MS,
    });

    return { outcome: 'processed', ...result };
  };

export default defineLogicFunction({
  universalIdentifier:
    SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'sweep-upcoming-calendar-events',
  description:
    'Reconciles upcoming calendar events on a schedule so meetings entering the scheduling horizon get their recording bots.',
  timeoutSeconds: TIMEOUT_SECONDS,
  handler: sweepUpcomingCalendarEventsHandler,
  cronTriggerSettings: {
    pattern: UPCOMING_CALENDAR_EVENTS_SWEEP_CRON_PATTERN,
  },
});
