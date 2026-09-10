export const buildBillingUsageCounterAdjustmentPattern = (
  workspaceId: string,
): string => {
  return `available-credits-adjusted:${workspaceId}:*`;
};
