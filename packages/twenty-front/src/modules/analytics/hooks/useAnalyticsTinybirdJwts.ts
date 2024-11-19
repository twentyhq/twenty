import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { AnalyticsTinybirdJwtMap } from '~/generated-metadata/graphql';

export const useAnalyticsTinybirdJwts = (
  jwtName: keyof AnalyticsTinybirdJwtMap,
): string | undefined => {
  const currentUser = useRecoilValue(currentUserState);

  if (!currentUser) {
    return undefined;
  }

  return currentUser.analyticsTinybirdJwts?.[jwtName];
};
