import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsLogged = (): boolean =>
  useAtomStateValue(isCookieAuthActiveState);
