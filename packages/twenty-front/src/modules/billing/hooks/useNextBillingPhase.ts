import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const useNextBillingPhase = () => {
  const currentWorkspace = useAtomValue(currentWorkspaceState);

  const nextBillingPhase =
    currentWorkspace?.currentBillingSubscription?.phases[1];

  return { nextBillingPhase };
};
