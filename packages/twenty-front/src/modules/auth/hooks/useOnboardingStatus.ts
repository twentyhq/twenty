import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';

import { useIsLogged } from '../hooks/useIsLogged';
import {
  getOnboardingStatus,
  OnboardingStatus,
} from '../utils/getOnboardingStatus';

export const useOnboardingStatus = (): OnboardingStatus | undefined => {
  const currentUser = useRecoilValue(currentUserState);
  const isLoggedIn = useIsLogged();

  return getOnboardingStatus({
    isLoggedIn,
    currentUser,
  });
};
