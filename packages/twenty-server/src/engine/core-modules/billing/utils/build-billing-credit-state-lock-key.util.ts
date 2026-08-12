/* @license Enterprise */

export const buildBillingCreditStateLockKey = (workspaceId: string): string =>
  `billing-credit-state:${workspaceId}`;
