import { tokenPairState } from '@/auth/states/tokenPairState';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';

export const useIsLogged = (): boolean => {
  const [tokenPair] = useRecoilStateV2(tokenPairState);
  return !!tokenPair;
};
