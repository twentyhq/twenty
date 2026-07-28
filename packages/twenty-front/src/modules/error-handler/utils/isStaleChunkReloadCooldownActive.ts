import { isNonEmptyString } from '@sniptt/guards';

import { STALE_CHUNK_RELOAD_COOLDOWN_MS } from '@/error-handler/constants/StaleChunkReloadCooldownMs';
import { STALE_CHUNK_RELOAD_TIMESTAMP_KEY } from '@/error-handler/constants/StaleChunkReloadTimestampKey';

export const isStaleChunkReloadCooldownActive = () => {
  try {
    const storedTimestamp = window.sessionStorage.getItem(
      STALE_CHUNK_RELOAD_TIMESTAMP_KEY,
    );

    const lastReloadTimestamp = isNonEmptyString(storedTimestamp)
      ? Number(storedTimestamp)
      : Number.NaN;

    return (
      Number.isFinite(lastReloadTimestamp) &&
      Date.now() - lastReloadTimestamp < STALE_CHUNK_RELOAD_COOLDOWN_MS
    );
  } catch {
    // without storage we cannot rate-limit reloads, so block them to avoid loops
    return true;
  }
};
