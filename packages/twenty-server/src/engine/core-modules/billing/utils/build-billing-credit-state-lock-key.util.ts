/* @license Enterprise */

// The rollover reads then rewrites the ledger, so a concurrent grant would be carried twice or dropped.
export const buildBillingCreditStateLockKey = (workspaceId: string): string =>
  `billing-credit-state:${workspaceId}`;
