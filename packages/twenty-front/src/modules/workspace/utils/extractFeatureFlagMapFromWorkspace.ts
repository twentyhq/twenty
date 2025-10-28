import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { FeatureFlagKey } from '~/generated/graphql';
import { buildRecordFromKeysWithSameValue } from '~/utils/array/buildRecordFromKeysWithSameValue';

export const extractFeatureFlagMapFromWorkspace = (
  currentWorkspace: CurrentWorkspace | null,
): Record<FeatureFlagKey, boolean> => {
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
