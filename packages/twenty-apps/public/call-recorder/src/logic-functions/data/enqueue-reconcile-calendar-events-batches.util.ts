import { enqueueJob } from 'twenty-sdk/logic-function';

import { RECONCILE_CALENDAR_EVENTS_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/reconcile-calendar-events-batch-logic-function-universal-identifier';
import { ENQUEUE_MAX_DELAY_MILLISECONDS } from 'src/logic-functions/constants/enqueue-max-delay-milliseconds';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { RECONCILIATION_BATCH_STAGGER_MILLISECONDS } from 'src/logic-functions/constants/reconciliation-batch-stagger-milliseconds';
import { UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE } from 'src/logic-functions/constants/upcoming-calendar-event-reconciliation-batch-size';

export type EnqueueReconcileCalendarEventsBatchesResult = {
  calendarEventCount: number;
  enqueuedBatchCount: number;
};

const buildCalendarEventIdBatches = (
  calendarEventIds: string[],
): string[][] => {
  const calendarEventIdBatches: string[][] = [];

  for (
    let batchStartIndex = 0;
    batchStartIndex < calendarEventIds.length;
    batchStartIndex += UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE
  ) {
    calendarEventIdBatches.push(
      calendarEventIds.slice(
        batchStartIndex,
        batchStartIndex + UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE,
      ),
    );
  }

  return calendarEventIdBatches;
};

export const enqueueReconcileCalendarEventsBatches = async ({
  calendarEventIds,
}: {
  calendarEventIds: string[];
}): Promise<EnqueueReconcileCalendarEventsBatchesResult> => {
  const calendarEventIdBatches = buildCalendarEventIdBatches(calendarEventIds);

  for (const [
    batchIndex,
    batchCalendarEventIds,
  ] of calendarEventIdBatches.entries()) {
    try {
      await enqueueJob({
        logicFunctionUniversalIdentifier:
          RECONCILE_CALENDAR_EVENTS_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        payload: { calendarEventIds: batchCalendarEventIds },
        retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
        delayMs: Math.min(
          batchIndex * RECONCILIATION_BATCH_STAGGER_MILLISECONDS,
          ENQUEUE_MAX_DELAY_MILLISECONDS,
        ),
      });
    } catch (error) {
      throw Object.assign(
        new Error(
          `calendar event reconciliation enqueued ${batchIndex} of ${calendarEventIdBatches.length} batches before enqueue failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ),
        { cause: error },
      );
    }
  }

  return {
    calendarEventCount: calendarEventIds.length,
    enqueuedBatchCount: calendarEventIdBatches.length,
  };
};
