import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { isDefined } from 'twenty-shared/utils';
import { type FeatureFlagKey } from '~/generated-admin/graphql';

export const useFeatureFlagState = () => {
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const updateFeatureFlagState = (
    workspaceId: string,
    featureFlag: FeatureFlagKey,
    value: boolean,
  ) => {
    if (isDefined(currentWorkspace) && currentWorkspace.id === workspaceId) {
      setCurrentWorkspace({
        ...currentWorkspace,
        featureFlags: currentWorkspace.featureFlags?.map((flag) =>
          flag.key === featureFlag ? { ...flag, value } : flag,
        ),
      });
    }
  };

  return {
    updateFeatureFlagState,
  };
};
