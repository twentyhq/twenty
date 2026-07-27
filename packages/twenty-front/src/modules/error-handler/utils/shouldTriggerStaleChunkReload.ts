import { isNonEmptyString } from '@sniptt/guards';

const STALE_CHUNK_RELOAD_TIMESTAMP_KEY = 'staleChunkReloadTimestamp';
const STALE_CHUNK_RELOAD_COOLDOWN_MS = 60_000;

export const shouldTriggerStaleChunkReload = () => {
  try {
    const storedTimestamp = window.sessionStorage.getItem(
      STALE_CHUNK_RELOAD_TIMESTAMP_KEY,
    );

    const lastReloadTimestamp = isNonEmptyString(storedTimestamp)
      ? Number(storedTimestamp)
      : Number.NaN;

    const isWithinCooldown =
      Number.isFinite(lastReloadTimestamp) &&
      Date.now() - lastReloadTimestamp < STALE_CHUNK_RELOAD_COOLDOWN_MS;

    if (isWithinCooldown) {
      return false;
    }

    window.sessionStorage.setItem(
      STALE_CHUNK_RELOAD_TIMESTAMP_KEY,
      Date.now().toString(),
    );

    return true;
  } catch {
    return false;
  }
};
