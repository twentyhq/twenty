import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { RECONCILE_CALENDAR_EVENTS_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/reconcile-calendar-events-batch-logic-function-universal-identifier';
import { countCallRecorderReconciliationActions } from 'src/logic-functions/domain/count-call-recorder-reconciliation-actions.util';
import { reconcileCallRecorderForCalendarEventIds } from 'src/logic-functions/flows/reconcile-call-recorder.util';
import { type CallRecorderReconciliationActionCounts } from 'src/logic-functions/types/call-recorder-reconciliation-action-counts.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type ReconcileCalendarEventsBatchResult =
  | { outcome: 'nothing-to-reconcile' }
  | {
      outcome: 'processed';
      actionCounts: CallRecorderReconciliationActionCounts;
    };

const toIdList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter(isNonEmptyString) : [];

// Reconciliation is idempotent (deterministic recording ids, conflict-safe
// creates), so an unexpected throw safely fails the job into a queue retry.
export const reconcileCalendarEventsBatchHandler = async (
  payload: { calendarEventIds?: unknown } | null | undefined,
): Promise<ReconcileCalendarEventsBatchResult> => {
  const calendarEventIds = toIdList(payload?.calendarEventIds);

  if (calendarEventIds.length === 0) {
    return { outcome: 'nothing-to-reconcile' };
  }

  const reconciliationResults = await reconcileCallRecorderForCalendarEventIds({
    client: new CoreApiClient(),
    calendarEventIds,
  });

  return {
    outcome: 'processed',
    actionCounts: countCallRecorderReconciliationActions(reconciliationResults),
  };
};

export default defineLogicFunction({
  universalIdentifier:
    RECONCILE_CALENDAR_EVENTS_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-calendar-events-batch',
  description:
    'Reconciles one enqueued batch of calendar events so their meetings get, keep, or lose recording bots.',
  timeoutSeconds: 250,
  handler: reconcileCalendarEventsBatchHandler,
});
