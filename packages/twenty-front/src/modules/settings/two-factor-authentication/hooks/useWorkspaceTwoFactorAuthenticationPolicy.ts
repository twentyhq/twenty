import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const useCurrentWorkspaceTwoFactorAuthenticationPolicy = () => {
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);

  return {
    isEnforced: currentWorkspace?.isTwoFactorAuthenticationEnforced ?? false,
  };
};
