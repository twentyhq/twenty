import { kv } from 'twenty-sdk/logic-function';

import { hasKvEntryExpired } from 'src/logic-functions/utils/has-kv-entry-expired';

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

  if (existingClaim !== null && !hasKvEntryExpired(existingClaim)) {
    return false;
  }

  await kv.set(key, {
    expiresAt: Date.now() + ttlMs,
  } satisfies SlackKvThrottleClaim);

  return true;
};
