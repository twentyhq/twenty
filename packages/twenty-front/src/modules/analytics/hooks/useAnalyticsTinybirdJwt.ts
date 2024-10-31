import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';

export const useAnalyticsTinybirdJwt = (
  jwtName: string,
): string | undefined => {
  const currentUser = useRecoilValue(currentUserState);

  if (!currentUser) {
    return undefined;
  }

  return currentUser.analyticsTinybirdJwt?.[jwtName];
};
