import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { extractFeatureFlagMapFromWorkspace } from '@/workspace/utils/extractFeatureFlagMapFromWorkspace';
import { type FeatureFlagKey } from '~/generated-metadata/graphql';

export const useFeatureFlagsMap = (): Record<FeatureFlagKey, boolean> => {
  const currentWorkspace = useAtomValue(currentWorkspaceState);

  return extractFeatureFlagMapFromWorkspace(currentWorkspace);
};
