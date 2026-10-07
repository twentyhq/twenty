/* @license Enterprise */

import { type CacheLockOptions } from 'src/engine/core-modules/cache-lock/cache-lock.service';

// Above the default 5.5s expiry: revoking RLS recomputes caches unbounded in workspace size
// maxRetries * ms must stay above ttl, or a waiter gives up just before a dead holder's key frees
export const BILLING_ENTITLEMENT_STATE_LOCK_OPTIONS = {
  ttl: 60_000,
  ms: 500,
  maxRetries: 130,
} satisfies CacheLockOptions;
