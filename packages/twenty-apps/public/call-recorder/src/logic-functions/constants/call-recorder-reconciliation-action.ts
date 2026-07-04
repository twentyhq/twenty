export const CallRecorderReconciliationAction = {
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  CANCELED: 'CANCELED',
  SKIPPED: 'SKIPPED',
  FAILED: 'FAILED',
} as const;

export type CallRecorderReconciliationAction =
  (typeof CallRecorderReconciliationAction)[keyof typeof CallRecorderReconciliationAction];
