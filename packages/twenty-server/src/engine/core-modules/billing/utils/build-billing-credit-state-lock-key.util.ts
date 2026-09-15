/* @license Enterprise */

// Serializes everything that moves a workspace's credit state: writing to the
// ledger and adjusting the counter derived from it. Readers take it too, but
// only when the counter is cold, so the warm path stays lock-free.
//
// Without it the ledger write and the counter update are two independent
// steps, and a reader computing availability in between either counts a grant
// that the writer then adds again, or installs a balance that predates it.
export const buildBillingCreditStateLockKey = (workspaceId: string): string =>
  `billing-credit-state:${workspaceId}`;
