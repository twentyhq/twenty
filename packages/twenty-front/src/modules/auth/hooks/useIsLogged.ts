import { useRecoilState } from 'recoil';

import { tokenPairState } from '@/auth/states/tokenPairState';

export const useIsLogged = (): boolean => {
  const [tokenPair] = useRecoilState(tokenPairState);
  return !!tokenPair;
};
