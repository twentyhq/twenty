export const buildBillingUsageAvailableCreditsCacheKey = (
  workspaceId: string,
  periodStart: Date | string,
): string => {
  return `available-credits:${workspaceId}:${new Date(periodStart).getTime()}`;
};
