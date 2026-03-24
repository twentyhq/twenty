import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useNextBillingPhase = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const nextBillingPhase =
    currentWorkspace?.currentBillingSubscription?.phases[1];

  return { nextBillingPhase };
};
