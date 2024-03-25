import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';

import { useIsLogged } from '../hooks/useIsLogged';
import {
  getOnboardingStatus,
  OnboardingStatus,
} from '../utils/getOnboardingStatus';

export const useOnboardingStatus = (): OnboardingStatus | undefined => {
  const billing = useRecoilValue(billingState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const isLoggedIn = useIsLogged();

  return getOnboardingStatus({
    isLoggedIn,
    currentWorkspaceMember,
    currentWorkspace,
    isBillingEnabled: billing?.isBillingEnabled,
  });
};
