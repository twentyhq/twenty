/* @license Enterprise */

// Serializes every write to a workspace's credit ledger. The rollover reads the
// ledger, decides from that snapshot, then writes it back, so a grant landing
// in between would be carried twice or dropped.
export const buildBillingCreditStateLockKey = (workspaceId: string): string =>
  `billing-credit-state:${workspaceId}`;
