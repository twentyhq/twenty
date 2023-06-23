import { useRecoilState } from 'recoil';

import { tokenPairState } from '../states/tokenPairState';

export function useIsLogged(): boolean {
  const [tokenPair] = useRecoilState(tokenPairState);

  return !!tokenPair;
}
