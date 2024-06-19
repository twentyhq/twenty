import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { OnboardingStep } from '~/generated/graphql';

import { useIsLogged } from '../hooks/useIsLogged';
import { getOnboardingStatus } from '../utils/getOnboardingStatus';

export const useOnboardingStatus = (): OnboardingStep | null | undefined => {
  const currentUser = useRecoilValue(currentUserState);
  const isLoggedIn = useIsLogged();

  return getOnboardingStatus({
    isLoggedIn,
    currentUser,
  });
};
