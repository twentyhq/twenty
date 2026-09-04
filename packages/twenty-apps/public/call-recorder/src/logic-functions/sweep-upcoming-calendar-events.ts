import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import {
  CLEAR_STALE_CALL_RECORDER_PREFERENCES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  RECONCILE_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE } from 'src/logic-functions/constants/upcoming-calendar-event-reconciliation-batch-size';
import { UPCOMING_CALENDAR_EVENTS_SWEEP_CRON_PATTERN } from 'src/logic-functions/constants/upcoming-calendar-events-sweep-cron-pattern';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import { fetchUpcomingCalendarEventIds } from 'src/logic-functions/data/fetch-upcoming-calendar-event-ids.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';
import { getBatches } from 'src/logic-functions/utils/get-batches.util';

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
      const client = new CoreApiClient();

      await enqueueLogicFunctionJobs({
        logicFunctionUniversalIdentifier:
          CLEAR_STALE_CALL_RECORDER_PREFERENCES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        payloads: [{}],
      });

      const calendarEventIds = await fetchUpcomingCalendarEventIds(
        client,
        new Date(),
      );

      if (calendarEventIds.length === 0) {
        return { outcome: 'nothing-to-reconcile' };
      }

      const calendarEventIdBatches = getBatches(
        calendarEventIds,
        UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE,
      );

      await enqueueLogicFunctionJobs({
        logicFunctionUniversalIdentifier:
          RECONCILE_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        payloads: calendarEventIdBatches.map((batchCalendarEventIds) => ({
          calendarEventIds: batchCalendarEventIds,
        })),
      });

      return {
        outcome: 'batches-enqueued',
        calendarEventCount: calendarEventIds.length,
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
    'Enqueues one reconciliation batch per group of upcoming calendar events on a schedule so meetings entering the scheduling horizon get their recording bots, and a cleanup of the default Recording Bot preference on past meetings.',
  timeoutSeconds: 900,
  handler: sweepUpcomingCalendarEventsHandler,
  cronTriggerSettings: {
    pattern: UPCOMING_CALENDAR_EVENTS_SWEEP_CRON_PATTERN,
  },
});
