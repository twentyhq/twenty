import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { userLookupResultState } from '@/settings/admin-panel/states/userLookupResultState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { isDefined } from 'twenty-shared/utils';
import { type FeatureFlagKey } from '~/generated-metadata/graphql';

export const useFeatureFlagState = () => {
  const [userLookupResult, setUserLookupResult] = useAtomState(
    userLookupResultState,
  );
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const updateFeatureFlagState = (
    workspaceId: string,
    featureFlag: FeatureFlagKey,
    value: boolean,
  ) => {
    if (!isDefined(userLookupResult)) return;

    setUserLookupResult({
      ...userLookupResult,
      workspaces: userLookupResult.workspaces.map((workspace) =>
        workspace.id === workspaceId
          ? {
              ...workspace,
              featureFlags: workspace.featureFlags.map((flag) =>
                flag.key === featureFlag ? { ...flag, value } : flag,
              ),
            }
          : workspace,
      ),
    });

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
