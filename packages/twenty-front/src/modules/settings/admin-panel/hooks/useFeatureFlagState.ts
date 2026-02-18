import { userLookupResultStateV2 } from '@/settings/admin-panel/states/userLookupResultStateV2';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { type FeatureFlagKey } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

export const useFeatureFlagState = () => {
  const [userLookupResult, setUserLookupResult] = useRecoilStateV2(
    userLookupResultStateV2,
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
