import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const useIsLogged = (): boolean => {
  const [tokenPair] = useAtomState(tokenPairState);
  const [isCookieAuthActive] = useAtomState(isCookieAuthActiveState);

  return !!tokenPair || isCookieAuthActive;
};
