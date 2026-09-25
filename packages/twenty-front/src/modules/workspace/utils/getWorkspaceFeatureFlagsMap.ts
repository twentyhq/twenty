import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';

// Keyed the way availability expressions read flags: `featureFlags.<KEY>`.
export const getWorkspaceFeatureFlagsMap = (
  workspaceFeatureFlags: CurrentWorkspace['featureFlags'],
): Record<string, boolean> => {
  const featureFlags: Record<string, boolean> = {};

  for (const flag of workspaceFeatureFlags ?? []) {
    featureFlags[flag.key] = flag.value === true;
  }

  return featureFlags;
};
