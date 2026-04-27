export const buildBillingUsageAvailableCreditsCacheKey = (
  workspaceId: string,
  periodStart: Date | string,
): string => {
  return `available-credits:${workspaceId}:${Math.floor(new Date(periodStart).getTime())}`;
};
