/* @license Enterprise */

import { type CacheLockOptions } from 'src/engine/core-modules/cache-lock/cache-lock.service';

// The default 5.5s expiry is shorter than this transition can run: revoking
// RLS recomputes the workspace's role and predicate caches, which is unbounded
// in the workspace's size. A lock that expires mid-transition hands the key to
// a second sync and restores the races this lock exists to remove, so the
// expiry is raised well past the slowest realistic pass. The wait to acquire
// matches it, so a webhook arriving during a fleet reconciliation queues
// behind it rather than failing.
export const BILLING_ENTITLEMENT_STATE_LOCK_OPTIONS: CacheLockOptions = {
  ttl: 60_000,
  ms: 500,
  maxRetries: 120,
};
