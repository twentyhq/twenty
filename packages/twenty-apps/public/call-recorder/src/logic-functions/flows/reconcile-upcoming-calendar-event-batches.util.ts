import { type CoreApiClient } from 'twenty-client-sdk/core';

import { UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE } from 'src/logic-functions/constants/upcoming-calendar-event-reconciliation-batch-size';
import { requestUpcomingCalendarEventsReconciliation } from 'src/logic-functions/data/request-upcoming-calendar-events-reconciliation.util';
import { reconcileCallRecorderForCalendarEventIds } from 'src/logic-functions/flows/reconcile-call-recorder.util';
import {
  type CallRecorderReconciliationActionCounts,
  type ReconcileUpcomingCalendarEventBatchesResult,
} from 'src/logic-functions/flows/reconcile-upcoming-calendar-event-batches-result.type';
import { type CallRecorderReconciliationResult } from 'src/logic-functions/types/call-recorder-reconciliation-result.type';

const ACTION_COUNT_KEY_BY_ACTION: {
  [Action in CallRecorderReconciliationResult['action']]: Lowercase<Action>;
} = {
  CREATED: 'created',
  UPDATED: 'updated',
  CANCELED: 'canceled',
  SKIPPED: 'skipped',
  FAILED: 'failed',
};

const logInfo = (message: string) => {
  if (process.env.NODE_ENV !== 'test') {
    console.info(message);
  }
};

export const reconcileUpcomingCalendarEventBatches = async ({
  client,
  calendarEventIds,
  deadlineAtMs,
  getNowMs = () => Date.now(),
}: {
  client: CoreApiClient;
  calendarEventIds: string[];
  deadlineAtMs: number;
  getNowMs?: () => number;
}): Promise<ReconcileUpcomingCalendarEventBatchesResult> => {
  const remainingCalendarEventIds = [...calendarEventIds];
  const reconciledCalendarEventIds: string[] = [];
  const failedCalendarEventIds: string[] = [];
  const actionCounts: CallRecorderReconciliationActionCounts = {
    created: 0,
    updated: 0,
    canceled: 0,
    skipped: 0,
    failed: 0,
  };
  let slowestBatchMs = 0;

  // Process at least one batch per run so the continuation payload strictly shrinks.
  while (remainingCalendarEventIds.length > 0) {
    const batchCalendarEventIds = remainingCalendarEventIds.slice(
      0,
      UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE,
    );
    const batchStartedAtMs = getNowMs();

    logInfo(
      `[call-recorder] reconciling upcoming calendar event batch: size=${batchCalendarEventIds.length}, remainingBeforeBatch=${remainingCalendarEventIds.length}`,
    );

    try {
      const reconciliationResults =
        await reconcileCallRecorderForCalendarEventIds({
          client,
          calendarEventIds: batchCalendarEventIds,
        });

      reconciledCalendarEventIds.push(...batchCalendarEventIds);

      const batchActionCounts = {
        created: 0,
        updated: 0,
        canceled: 0,
        skipped: 0,
        failed: 0,
      };

      for (const reconciliationResult of reconciliationResults) {
        const actionCountKey =
          ACTION_COUNT_KEY_BY_ACTION[reconciliationResult.action];

        actionCounts[actionCountKey] += 1;
        batchActionCounts[actionCountKey] += 1;
      }

      logInfo(
        `[call-recorder] upcoming calendar event batch reconciled: created=${batchActionCounts.created}, updated=${batchActionCounts.updated}, canceled=${batchActionCounts.canceled}, skipped=${batchActionCounts.skipped}, failed=${batchActionCounts.failed}`,
      );
    } catch (error) {
      failedCalendarEventIds.push(...batchCalendarEventIds);

      if (process.env.NODE_ENV !== 'test') {
        console.error(
          `[call-recorder] upcoming calendar event batch reconciliation failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    remainingCalendarEventIds.splice(0, batchCalendarEventIds.length);
    slowestBatchMs = Math.max(slowestBatchMs, getNowMs() - batchStartedAtMs);

    if (getNowMs() + slowestBatchMs > deadlineAtMs) {
      break;
    }
  }

  const continuationRequested =
    remainingCalendarEventIds.length > 0
      ? await requestUpcomingCalendarEventsReconciliation({
          calendarEventIds: remainingCalendarEventIds,
        })
      : false;

  logInfo(
    `[call-recorder] upcoming calendar event reconciliation batch run finished: reconciled=${reconciledCalendarEventIds.length}, failed=${failedCalendarEventIds.length}, remaining=${remainingCalendarEventIds.length}, continuationRequested=${continuationRequested}`,
  );

  return {
    reconciledCalendarEventIds,
    failedCalendarEventIds,
    remainingCalendarEventIds,
    actionCounts,
    continuationRequested,
  };
};
