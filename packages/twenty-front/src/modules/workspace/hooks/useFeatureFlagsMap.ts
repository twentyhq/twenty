import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { extractFeatureFlagMapFromWorkspace } from '@/workspace/utils/extractFeatureFlagMapFromWorkspace';
import { type FeatureFlagKey } from '~/generated-metadata/graphql';

export const useFeatureFlagsMap = (): Record<FeatureFlagKey, boolean> => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  return extractFeatureFlagMapFromWorkspace(currentWorkspace);
};
