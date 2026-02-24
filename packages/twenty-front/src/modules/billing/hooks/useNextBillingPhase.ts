import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const useNextBillingPhase = () => {
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);

  const nextBillingPhase =
    currentWorkspace?.currentBillingSubscription?.phases[1];

  return { nextBillingPhase };
};
