/* @license Enterprise */

import { type CacheLockOptions } from 'src/engine/core-modules/cache-lock/cache-lock.service';

// The default 5.5s expiry is shorter than this transition can run: revoking
// RLS recomputes the workspace's role and predicate caches, which is unbounded
// in the workspace's size. A lock that expires mid-transition hands the key to
// a second sync and restores the races this lock exists to remove.
//
// maxRetries * ms must stay above ttl. withLock attempts at 0, ms, 2*ms and so
// on, so a waiter whose budget only equals the expiry makes its last attempt
// just before the key frees and throws instead of taking it, which is exactly
// the case that matters: a holder that died leaves the key held for the full
// expiry. The extra retries buy a waiter attempts on the far side of it.
export const BILLING_ENTITLEMENT_STATE_LOCK_OPTIONS = {
  ttl: 60_000,
  ms: 500,
  maxRetries: 130,
} satisfies CacheLockOptions;
