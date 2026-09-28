import { type CacheLockOptions } from 'src/engine/core-modules/cache-lock/cache-lock.service';

export const ONBOARDING_INVITE_TEAM_REWARD_LOCK_OPTIONS = {
  ttl: 30_000,
  ms: 200,
  maxRetries: 200,
} satisfies CacheLockOptions;
