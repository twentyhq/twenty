import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { isNull } from '@sniptt/guards';

export const useAnalyticsTinybirdJwt = (): string | undefined => {
  const currentUser = useRecoilValue(currentUserState);

  if (!currentUser) {
    return undefined;
  }

  if (isNull(currentUser.analyticsTinybirdJwt)) {
    return undefined;
  }

  return currentUser.analyticsTinybirdJwt;
};
