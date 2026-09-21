import { STALE_CHUNK_RELOAD_TIMESTAMP_KEY } from '@/error-handler/constants/StaleChunkReloadTimestampKey';

export const storeStaleChunkReloadTimestamp = () => {
  try {
    window.sessionStorage.setItem(
      STALE_CHUNK_RELOAD_TIMESTAMP_KEY,
      Date.now().toString(),
    );

    return true;
  } catch {
    return false;
  }
};
