import { useRecoilValue } from 'recoil';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

export const useNextBillingPhase = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const nextBillingPhase =
    currentWorkspace?.currentBillingSubscription?.phases[1];

  return { nextBillingPhase };
};
