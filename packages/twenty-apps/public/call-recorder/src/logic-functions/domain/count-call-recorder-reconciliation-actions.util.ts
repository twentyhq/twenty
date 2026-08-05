import { type CallRecorderReconciliationActionCounts } from 'src/logic-functions/types/call-recorder-reconciliation-action-counts.type';
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

export const countCallRecorderReconciliationActions = (
  reconciliationResults: CallRecorderReconciliationResult[],
): CallRecorderReconciliationActionCounts => {
  const actionCounts: CallRecorderReconciliationActionCounts = {
    created: 0,
    updated: 0,
    canceled: 0,
    skipped: 0,
    failed: 0,
  };

  for (const reconciliationResult of reconciliationResults) {
    actionCounts[ACTION_COUNT_KEY_BY_ACTION[reconciliationResult.action]] += 1;
  }

  return actionCounts;
};
