import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValue } from 'recoil';

export const useCurrentWorkspaceTwoFactorAuthenticationPolicy = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  return {
    isEnforced: currentWorkspace?.isTwoFactorAuthenticationEnforced ?? false,
  };
};
