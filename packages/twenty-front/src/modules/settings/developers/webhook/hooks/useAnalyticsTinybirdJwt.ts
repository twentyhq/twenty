import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';

export const useAnalyticsTinybirdJwt = (): string | null | undefined => {
  const currentUser = useRecoilValue(currentUserState);
  return currentUser?.analyticsTinybirdJwt;
};
