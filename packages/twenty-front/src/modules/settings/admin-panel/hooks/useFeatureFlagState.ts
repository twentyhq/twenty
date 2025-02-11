import { userLookupResultState } from '@/settings/admin-panel/states/userLookupResultState';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';
import { FeatureFlagKey } from '~/generated/graphql';

export const useFeatureFlagState = () => {
  const [userLookupResult, setUserLookupResult] = useRecoilState(
    userLookupResultState,
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
  };

  return {
    updateFeatureFlagState,
  };
};
