import { type CacheLockOptions } from 'src/engine/core-modules/cache-lock/cache-lock.service';

export const APPLICATION_LIFECYCLE_LOCK_OPTIONS: CacheLockOptions = {
  ttl: 60_000,
  ms: 500,
  maxRetries: 120,
};
