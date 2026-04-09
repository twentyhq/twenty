import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCurrentWorkspaceTwoFactorAuthenticationPolicy = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  return {
    isEnforced: currentWorkspace?.isTwoFactorAuthenticationEnforced ?? false,
  };
};
