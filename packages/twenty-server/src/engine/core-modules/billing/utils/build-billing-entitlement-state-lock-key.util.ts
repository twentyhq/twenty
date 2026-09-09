/* @license Enterprise */

// Serializes a workspace's entitlement transition: reading the stored rows,
// applying the side effects that depend on that transition, and committing the
// new rows. The Stripe webhook and the reconciliation command both run this
// sequence, so without the lock two overlapping syncs read the same "before"
// state and each apply a transition the other has already applied.
export const buildBillingEntitlementStateLockKey = (
  workspaceId: string,
): string => `billing-entitlement-state:${workspaceId}`;
