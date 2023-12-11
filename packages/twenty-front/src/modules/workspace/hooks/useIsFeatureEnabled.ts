import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

export const useIsFeatureEnabled = (featureKey: string): boolean => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const featureFlag = currentWorkspace?.featureFlags?.find(
    (flag) => flag.key === featureKey,
  );

  if (!featureFlag) {
    return false;
  }

  return featureFlag.value;
};
