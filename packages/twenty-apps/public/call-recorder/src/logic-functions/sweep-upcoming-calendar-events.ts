import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import {
  RECONCILE_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import { fetchUpcomingCalendarEvents } from 'src/logic-functions/data/fetch-upcoming-calendar-events.util';
import { groupUpcomingCalendarEventIdsIntoBatches } from 'src/logic-functions/domain/group-upcoming-calendar-event-ids-into-batches.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';
import { fetchWithRateLimitRetry } from 'src/logic-functions/utils/fetch-with-rate-limit-retry.util';

type SweepUpcomingCalendarEventsResult =
  | { outcome: 'nothing-to-reconcile' }
  | {
      outcome: 'batches-enqueued';
      calendarEventCount: number;
      batchCount: number;
    };

export const sweepUpcomingCalendarEventsHandler =
  async (): Promise<SweepUpcomingCalendarEventsResult> => {
    try {
      const client = new CoreApiClient({ fetch: fetchWithRateLimitRetry });

      const calendarEventIdBatches = groupUpcomingCalendarEventIdsIntoBatches(
        await fetchUpcomingCalendarEvents(client, new Date()),
      );

      if (calendarEventIdBatches.length === 0) {
        return { outcome: 'nothing-to-reconcile' };
      }

      await enqueueLogicFunctionJobs({
        logicFunctionUniversalIdentifier:
          RECONCILE_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        payloads: calendarEventIdBatches.map((batchCalendarEventIds) => ({
          calendarEventIds: batchCalendarEventIds,
        })),
      });

      return {
        outcome: 'batches-enqueued',
        calendarEventCount: calendarEventIdBatches.flat().length,
        batchCount: calendarEventIdBatches.length,
      };
    } catch (error) {
      throw buildRetryableStepFailure('upcoming calendar events sweep', error);
    }
  };

export default defineLogicFunction({
  universalIdentifier:
    SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'sweep-upcoming-calendar-events',
  description:
    'Enqueues one reconciliation batch per group of upcoming calendar events so meetings entering the scheduling horizon get their recording bots.',
  timeoutSeconds: 900,
  handler: sweepUpcomingCalendarEventsHandler,
});
