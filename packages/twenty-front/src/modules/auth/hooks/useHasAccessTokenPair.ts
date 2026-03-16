import { tokenPairState } from '@/auth/states/tokenPairState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const useHasAccessTokenPair = (): boolean => {
  const [tokenPair] = useAtomState(tokenPairState);
  return !!tokenPair;
};
