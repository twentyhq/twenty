import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';

import { useIsLogged } from '../hooks/useIsLogged';
import {
  getOnboardingStatus,
  OnboardingStatus,
} from '../utils/getOnboardingStatus';

export const useOnboardingStatus = (): OnboardingStatus | undefined => {
  const billing = useRecoilValue(billingState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentUser = useRecoilValue(currentUserState);
  const isLoggedIn = useIsLogged();

  return getOnboardingStatus({
    isLoggedIn,
    currentWorkspace,
    currentUser,
    isBillingEnabled: billing?.isBillingEnabled || false,
  });
};
