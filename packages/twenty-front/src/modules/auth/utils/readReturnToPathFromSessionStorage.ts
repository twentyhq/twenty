import { RETURN_TO_PATH_SESSION_KEY } from '@/auth/constants/ReturnToPathSessionKey';
import { RETURN_TO_PATH_TTL_MS } from '@/auth/constants/ReturnToPathTtl';
import { isReturnToPathSessionStorageEntry } from '@/auth/utils/isReturnToPathSessionStorageEntry';

export const readReturnToPathFromSessionStorage = (): string | null => {
  try {
    const raw = sessionStorage.getItem(RETURN_TO_PATH_SESSION_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isReturnToPathSessionStorageEntry(parsed)) {
      return null;
    }

    if (Date.now() - parsed.timestamp > RETURN_TO_PATH_TTL_MS) {
      sessionStorage.removeItem(RETURN_TO_PATH_SESSION_KEY);

      return null;
    }

    return parsed.path;
  } catch {
    return null;
  }
};
