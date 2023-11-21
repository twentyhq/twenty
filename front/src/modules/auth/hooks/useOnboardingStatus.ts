import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

import { useIsLogged } from '../hooks/useIsLogged';
import {
  getOnboardingStatus,
  OnboardingStatus,
} from '../utils/getOnboardingStatus';

export const useOnboardingStatus = (): OnboardingStatus | undefined => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const isLoggedIn = useIsLogged();

  return getOnboardingStatus(
    isLoggedIn,
    currentWorkspaceMember,
    currentWorkspace,
  );
};
