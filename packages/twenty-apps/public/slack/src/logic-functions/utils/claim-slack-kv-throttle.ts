import { isNumber } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

type SlackKvThrottleClaim = {
  expiresAt: number;
};

export const claimSlackKvThrottle = async ({
  key,
  ttlMs,
}: {
  key: string;
  ttlMs: number;
}): Promise<boolean> => {
  const existingClaim = await kv.get<SlackKvThrottleClaim>(key);

  if (
    existingClaim !== null &&
    isNumber(existingClaim.expiresAt) &&
    existingClaim.expiresAt > Date.now()
  ) {
    return false;
  }

  await kv.set(key, {
    expiresAt: Date.now() + ttlMs,
  } satisfies SlackKvThrottleClaim);

  return true;
};
