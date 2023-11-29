import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

export const useIsFeatureEnabled = (featureKey: string): boolean => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  return true;
};
