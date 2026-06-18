export const buildBillingUsageAvailableCreditsCachePattern = (
  workspaceId: string,
): string => {
  return `available-credits:${workspaceId}:*`;
};
