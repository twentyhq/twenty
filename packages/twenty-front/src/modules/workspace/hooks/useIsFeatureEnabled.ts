import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { FeatureFlagKey } from '@/workspace/types/FeatureFlagKey';

export const useIsFeatureEnabled = (featureKey: FeatureFlagKey) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const featureFlag = currentWorkspace?.featureFlags?.find(
    (flag) => flag.key === featureKey,
  );

  return !!featureFlag?.value;
};
