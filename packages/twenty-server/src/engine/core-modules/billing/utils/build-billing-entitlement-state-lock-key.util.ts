/* @license Enterprise */

export const buildBillingEntitlementStateLockKey = (
  workspaceId: string,
): string => `billing-entitlement-state:${workspaceId}`;
