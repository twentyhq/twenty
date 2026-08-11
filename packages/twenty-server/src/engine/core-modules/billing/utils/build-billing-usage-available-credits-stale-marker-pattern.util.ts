export const buildBillingUsageAvailableCreditsStaleMarkerPattern = (
  workspaceId: string,
): string => {
  return `available-credits-stale:${workspaceId}:*`;
};
