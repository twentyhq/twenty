import { adminPanelErrorState } from '@/settings/admin-panel/states/adminPanelErrorState';
import { userLookupResultState } from '@/settings/admin-panel/states/userLookupResultState';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';
import {
  FeatureFlagKey,
  useUpdateWorkspaceFeatureFlagMutation,
} from '~/generated/graphql';

export const useFeatureFlag = () => {
  const [userLookupResult, setUserLookupResult] = useRecoilState(
    userLookupResultState,
  );

  const setError = useSetRecoilState(adminPanelErrorState);

  const [updateFeatureFlag] = useUpdateWorkspaceFeatureFlagMutation();

  const handleFeatureFlagUpdate = async (
    workspaceId: string,
    featureFlag: FeatureFlagKey,
    value: boolean,
  ) => {
    setError(null);
    const previousState = userLookupResult;

    if (isDefined(userLookupResult)) {
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
    }

    const response = await updateFeatureFlag({
      variables: {
        workspaceId,
        featureFlag,
        value,
      },
      onError: (error) => {
        if (isDefined(previousState)) {
          setUserLookupResult(previousState);
        }
        setError(error.message);
      },
    });

    return !!response.data;
  };

  return {
    handleFeatureFlagUpdate,
  };
};
