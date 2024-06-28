import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { OnboardingStatus } from '~/generated/graphql';

export const useOnboardingStatus = (): OnboardingStatus | null | undefined => {
  const currentUser = useRecoilValue(currentUserState);
  return currentUser?.onboardingStatus;
};
