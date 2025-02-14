import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated/graphql';

export const useFeatureFlagsMap = (): Record<FeatureFlagKey, boolean> => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const currentWorkspaceFeatureFlags = currentWorkspace?.featureFlags;

  const initialFeatureFlags = Object.fromEntries(
    Object.values(FeatureFlagKey).map((feature) => [feature, false]),
  ) as Record<FeatureFlagKey, boolean>;

  if (!currentWorkspaceFeatureFlags) {
    return initialFeatureFlags;
  }

  return currentWorkspaceFeatureFlags.reduce(
    (acc, featureFlag) => {
      acc[featureFlag.key] = featureFlag.value;
      return acc;
    },
    { ...initialFeatureFlags },
  );
};
