import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { extractFeatureFlagMapFromWorkspace } from '@/workspace/utils/extractFeatureFlagMapFromWorkspace';
import { useRecoilValue } from 'recoil';
import { type FeatureFlagKey } from '~/generated/graphql';

export const useFeatureFlagsMap = (): Record<FeatureFlagKey, boolean> => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  return extractFeatureFlagMapFromWorkspace(currentWorkspace);
};
