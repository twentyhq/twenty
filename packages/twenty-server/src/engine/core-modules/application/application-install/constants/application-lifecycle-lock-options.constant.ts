import { type CacheLockOptions } from 'src/engine/core-modules/cache-lock/cache-lock.service';

// An install or uninstall applies a whole manifest and runs its hooks, well
// beyond the default lock lifetime
export const APPLICATION_LIFECYCLE_LOCK_OPTIONS: CacheLockOptions = {
  ttl: 60_000,
  ms: 500,
  maxRetries: 120,
};
