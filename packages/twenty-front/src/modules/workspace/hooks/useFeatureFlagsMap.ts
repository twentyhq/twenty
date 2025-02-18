import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated/graphql';
import { buildRecordFromKeysWithSameValue } from '~/utils/array/buildRecordFromKeysWithSameValue';

export const useFeatureFlagsMap = (): Record<FeatureFlagKey, boolean> => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const currentWorkspaceFeatureFlags = currentWorkspace?.featureFlags;

  const initialFeatureFlags = buildRecordFromKeysWithSameValue(
    Object.values(FeatureFlagKey),
    false,
  );

  if (!currentWorkspaceFeatureFlags) {
    return initialFeatureFlags;
  }

  return currentWorkspaceFeatureFlags.reduce((acc, featureFlag) => {
    acc[featureFlag.key] = featureFlag.value;
    return acc;
  }, initialFeatureFlags);
};
