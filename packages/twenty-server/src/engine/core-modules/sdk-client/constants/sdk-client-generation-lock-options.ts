import { type CacheLockOptions } from 'src/engine/core-modules/cache-lock/cache-lock.service';

const RETRY_MS = 500;

// Covers the first generation after a deploy: activating the generator Lambda,
// then invoking it with a cold start.
const WAIT_BUDGET_MS = 4 * 60 * 1000;

export const SDK_CLIENT_GENERATION_LOCK_OPTIONS: CacheLockOptions = {
  ms: RETRY_MS,
  maxRetries: WAIT_BUDGET_MS / RETRY_MS,
  ttl: 30_000,
};
