// Deliberately outside the available-credits: namespace so flushing the
// counters does not clear the markers and reopen the window they guard.
export const buildBillingUsageAvailableCreditsStaleMarkerKey = (
  workspaceId: string,
  periodStart: Date | string,
): string => {
  return `available-credits-stale:${workspaceId}:${new Date(periodStart).getTime()}`;
};

// Records that a one-off adjustment (a revocation) already moved the counter,
// so a retry can tell "already applied" from "never got that far".
export const buildBillingUsageCounterAdjustmentKey = (
  workspaceId: string,
  adjustmentKey: string,
): string => {
  return `available-credits-adjusted:${workspaceId}:${adjustmentKey}`;
};

export const buildBillingUsageAvailableCreditsStaleMarkerPattern = (
  workspaceId: string,
): string => {
  return `available-credits-stale:${workspaceId}:*`;
};

export const buildBillingUsageCounterAdjustmentPattern = (
  workspaceId: string,
): string => {
  return `available-credits-adjusted:${workspaceId}:*`;
};
