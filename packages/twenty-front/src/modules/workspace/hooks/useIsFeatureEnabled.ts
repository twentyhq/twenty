import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { FeatureFlagKey } from '~/generated/graphql';

export const useIsFeatureEnabled = (featureKey: FeatureFlagKey | null) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  if (!featureKey) {
    return false;
  }

  const featureFlag = currentWorkspace?.featureFlags?.find(
    (flag) => flag.key === featureKey,
  );

  return !!featureFlag?.value;
};
