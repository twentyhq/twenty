import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceFeatureFlagsMap } from '@/workspace/utils/getWorkspaceFeatureFlagsMap';
import { useMemo } from 'react';

export const useWorkspaceFeatureFlagsMap = (): Record<string, boolean> => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const workspaceFeatureFlags = currentWorkspace?.featureFlags;

  return useMemo(
    () => getWorkspaceFeatureFlagsMap(workspaceFeatureFlags),
    [workspaceFeatureFlags],
  );
};
