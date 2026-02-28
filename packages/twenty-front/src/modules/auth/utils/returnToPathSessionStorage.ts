import { RETURN_TO_PATH_SESSION_KEY } from '@/auth/constants/ReturnToPathSessionKey';
import { RETURN_TO_PATH_TTL_MS } from '@/auth/constants/ReturnToPathTtl';
import { isNonEmptyString } from '@sniptt/guards';

export const writeReturnToPathToSessionStorage = (path: string) => {
  try {
    sessionStorage.setItem(
      RETURN_TO_PATH_SESSION_KEY,
      JSON.stringify({ path, timestamp: Date.now() }),
    );
  } catch {
    // sessionStorage may be unavailable in some contexts
  }
};

export const readReturnToPathFromSessionStorage = (): string | null => {
  try {
    const raw = sessionStorage.getItem(RETURN_TO_PATH_SESSION_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (
      typeof parsed !== 'object' ||
      !isNonEmptyString(parsed?.path) ||
      typeof parsed?.timestamp !== 'number'
    ) {
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

export const clearReturnToPathFromSessionStorage = () => {
  try {
    sessionStorage.removeItem(RETURN_TO_PATH_SESSION_KEY);
  } catch {
    // sessionStorage may be unavailable in some contexts
  }
};
