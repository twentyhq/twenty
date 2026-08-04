import { IS_COOKIE_AUTH_ACTIVE_LOCAL_STORAGE_KEY } from '@/auth/states/isCookieAuthActiveState';

// Read and written outside React because the Apollo links run per request and
// have to agree with the atom synchronously: the link decides whether to attach
// the Bearer header, and a React state update would land a render too late.
export const getIsCookieAuthActive = (): boolean => {
  try {
    return (
      JSON.parse(
        localStorage.getItem(IS_COOKIE_AUTH_ACTIVE_LOCAL_STORAGE_KEY) ??
          'false',
      ) === true
    );
  } catch {
    return false;
  }
};

export const setIsCookieAuthActiveInStorage = (isActive: boolean): void => {
  // Called from the unauthenticated-error path, where a storage exception
  // would escape into error handling. Blocked storage degrades to keeping the
  // in-memory atom as the only record of the switch.
  try {
    localStorage.setItem(
      IS_COOKIE_AUTH_ACTIVE_LOCAL_STORAGE_KEY,
      JSON.stringify(isActive),
    );
  } catch {
    // noop
  }
};
