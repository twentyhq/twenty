/* @license Enterprise */

import { type CacheLockOptions } from 'src/engine/core-modules/cache-lock/cache-lock.service';

export const BILLING_SUBSCRIPTION_STATE_LOCK_OPTIONS = {
  ttl: 30_000,
  ms: 200,
  maxRetries: 50,
} satisfies CacheLockOptions;
