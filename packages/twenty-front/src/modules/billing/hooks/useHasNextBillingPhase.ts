import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const useHasNextBillingPhase = () => {
  const currentWorkspace = useAtomValue(currentWorkspaceState);

  const hasNextBillingPhase =
    currentWorkspace?.currentBillingSubscription?.phases.length === 2;

  return { hasNextBillingPhase };
};
