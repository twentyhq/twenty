export const buildBillingUsageCounterAdjustmentKey = (
  workspaceId: string,
  adjustmentKey: string,
): string => {
  return `available-credits-adjusted:${workspaceId}:${adjustmentKey}`;
};
