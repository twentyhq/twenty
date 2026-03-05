import { tokenPairState } from '@/auth/states/tokenPairState';
import { isValidAuthTokenPair } from '@/apollo/utils/isValidAuthTokenPair';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const useIsLogged = (): boolean => {
  const [tokenPair] = useAtomState(tokenPairState);
  return isValidAuthTokenPair(tokenPair);
};
