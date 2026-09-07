import { type CallRecorderReconciliationResult } from 'src/logic-functions/types/call-recorder-reconciliation-result.type';

export type CallRecorderReconciliationActionCounts = Record<
  Lowercase<CallRecorderReconciliationResult['action']>,
  number
>;
