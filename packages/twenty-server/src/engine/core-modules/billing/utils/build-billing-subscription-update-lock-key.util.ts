/* @license Enterprise */

export const buildBillingSubscriptionUpdateLockKey = (
  workspaceId: string,
): string => `billing-subscription-update:${workspaceId}`;
