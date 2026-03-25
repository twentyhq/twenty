import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useHasNextBillingPhase = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const hasNextBillingPhase =
    currentWorkspace?.currentBillingSubscription?.phases.length === 2;

  return { hasNextBillingPhase };
};
