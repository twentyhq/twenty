import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { type FeatureFlagKey } from '~/generated-metadata/graphql';

export const useIsFeatureEnabled = (featureKey: FeatureFlagKey | null) => {
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);

  if (!featureKey) {
    return false;
  }

  const featureFlag = currentWorkspace?.featureFlags?.find(
    (flag) => flag.key === featureKey,
  );

  return !!featureFlag?.value;
};
