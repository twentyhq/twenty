// Deliberately outside the available-credits: namespace so flushing the
// counters does not clear the markers and reopen the window they guard.
export const buildBillingUsageAvailableCreditsStaleMarkerKey = (
  workspaceId: string,
  periodStart: Date | string,
): string => {
  return `available-credits-stale:${workspaceId}:${new Date(periodStart).getTime()}`;
};
