import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { extractFeatureFlagMapFromWorkspace } from '@/workspace/utils/extractFeatureFlagMapFromWorkspace';
import { type FeatureFlagKey } from '~/generated-metadata/graphql';

export const useFeatureFlagsMap = (): Record<FeatureFlagKey, boolean> => {
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);

  return extractFeatureFlagMapFromWorkspace(currentWorkspace);
};
