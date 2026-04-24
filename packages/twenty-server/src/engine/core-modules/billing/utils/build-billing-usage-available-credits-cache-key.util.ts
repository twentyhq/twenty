export const buildBillingUsageAvailableCreditsCacheKey = (
  workspaceId: string,
  periodStart: Date | string,
): string => {
  return `available-credits:${workspaceId}:${new Date(periodStart).toISOString().slice(0, 23)}`;
};
