import { useMemo } from 'react';
import { useRecoilState } from 'recoil';

import { useIsLogged } from '../hooks/useIsLogged';
import { currentUserState } from '../states/currentUserState';
import {
  getOnboardingStatus,
  OnboardingStatus,
} from '../utils/getOnboardingStatus';

export function useOnboardingStatus(): OnboardingStatus | undefined {
  const [currentUser] = useRecoilState(currentUserState);
  const isLoggedIn = useIsLogged();

  const onboardingStatus = useMemo(
    () => getOnboardingStatus(isLoggedIn, currentUser),
    [currentUser, isLoggedIn],
  );

  return onboardingStatus;
}
