import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

export const useCurrentBillingChargeFileLink = (): string | null => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  return (
    currentWorkspace?.currentBillingSubscription?.currentChargeFileLink ?? null
  );
};
