import { type FeatureFlag } from '~/generated-metadata/graphql';

// Keyed the way availability expressions read flags: `featureFlags.<KEY>`.
export const getWorkspaceFeatureFlagsMap = (
  workspaceFeatureFlags:
    | Pick<FeatureFlag, 'key' | 'value'>[]
    | null
    | undefined,
): Record<string, boolean> => {
  const featureFlags: Record<string, boolean> = {};

  for (const flag of workspaceFeatureFlags ?? []) {
    featureFlags[flag.key] = flag.value;
  }

  return featureFlags;
};
