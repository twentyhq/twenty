import { useRecoilValue } from 'recoil';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

export const useHasNextBillingPhase = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const hasNextBillingPhase =
    currentWorkspace?.currentBillingSubscription?.phases.length === 2;

  return { hasNextBillingPhase };
};
