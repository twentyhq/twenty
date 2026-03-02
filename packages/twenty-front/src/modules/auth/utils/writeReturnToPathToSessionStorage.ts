import { RETURN_TO_PATH_SESSION_KEY } from '@/auth/constants/ReturnToPathSessionKey';

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
