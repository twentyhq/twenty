import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const useCurrentWorkspaceTwoFactorAuthenticationPolicy = () => {
  const currentWorkspace = useAtomValue(currentWorkspaceState);

  return {
    isEnforced: currentWorkspace?.isTwoFactorAuthenticationEnforced ?? false,
  };
};
