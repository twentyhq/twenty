import { useRecoilState, useRecoilValue } from 'recoil';

import { isVerifyPendingState } from '@/auth/states/isVerifyPendingState';

import { tokenPairState } from '../states/tokenPairState';

export const useIsLogged = (): boolean => {
  const [tokenPair] = useRecoilState(tokenPairState);
  const isVerifyPending = useRecoilValue(isVerifyPendingState);

  return !!tokenPair && !isVerifyPending;
};
