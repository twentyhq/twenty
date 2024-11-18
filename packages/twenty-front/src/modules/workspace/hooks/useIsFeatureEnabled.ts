import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { FeatureFlagKey } from '@/workspace/types/FeatureFlagKey';

export const useIsFeatureEnabled = (featureKey: FeatureFlagKey | null) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  if (!featureKey) {
    return false;
  }

  const featureFlag = currentWorkspace?.featureFlags?.find(
    (flag) => flag.key === featureKey,
  );

  console.log('featureFlag', currentWorkspace?.featureFlags, featureFlag);

  return !!featureFlag?.value;
};
