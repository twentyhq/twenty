import { RETURN_TO_PATH_SESSION_KEY } from '@/auth/constants/ReturnToPathSessionKey';

export const clearReturnToPathFromSessionStorage = () => {
  try {
    sessionStorage.removeItem(RETURN_TO_PATH_SESSION_KEY);
  } catch {
    // sessionStorage may be unavailable in some contexts
  }
};
