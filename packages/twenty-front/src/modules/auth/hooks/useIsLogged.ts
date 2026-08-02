import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

// Logged in means holding either credential: the legacy localStorage token
// pair or a confirmed httpOnly session cookie.
export const useIsLogged = (): boolean => {
  const [tokenPair] = useAtomState(tokenPairState);
  const [isCookieAuthActive] = useAtomState(isCookieAuthActiveState);

  return !!tokenPair || isCookieAuthActive;
};
