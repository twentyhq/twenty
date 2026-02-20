import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const useHasNextBillingPhase = () => {
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);

  const hasNextBillingPhase =
    currentWorkspace?.currentBillingSubscription?.phases.length === 2;

  return { hasNextBillingPhase };
};
