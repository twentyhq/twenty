import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { type FeatureFlagKey } from '~/generated-metadata/graphql';

export const useIsFeatureEnabled = (featureKey: FeatureFlagKey | null) => {
  const currentWorkspace = useAtomValue(currentWorkspaceState);

  if (!featureKey) {
    return false;
  }

  const featureFlag = currentWorkspace?.featureFlags?.find(
    (flag) => flag.key === featureKey,
  );

  return !!featureFlag?.value;
};
