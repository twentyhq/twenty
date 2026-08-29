// Records that a one-off adjustment (a revocation, a period transition) already
// moved the counter, so a retry can tell "already applied" from "never got that
// far".
export const buildBillingUsageCounterAdjustmentKey = (
  workspaceId: string,
  adjustmentKey: string,
): string => {
  return `available-credits-adjusted:${workspaceId}:${adjustmentKey}`;
};
