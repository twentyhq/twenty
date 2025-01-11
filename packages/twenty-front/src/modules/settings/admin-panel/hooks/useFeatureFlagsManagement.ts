import { UserLookup } from '@/settings/admin-panel/types/UserLookup';
import { useState } from 'react';
import { isDefined } from 'twenty-ui';
import {
  useUpdateWorkspaceFeatureFlagMutation,
  useUserLookupAdminPanelMutation,
  FeatureFlagKey,
} from '~/generated/graphql';

export const useFeatureFlagsManagement = () => {
  const [userLookupResult, setUserLookupResult] = useState<UserLookup | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userLookup] = useUserLookupAdminPanelMutation({
    onCompleted: (data) => {
      setIsLoading(false);
      if (isDefined(data?.userLookupAdminPanel)) {
        setUserLookupResult(data.userLookupAdminPanel);
      }
    },
    onError: (error) => {
      setIsLoading(false);
      setError(error.message);
    },
  });

  const [updateFeatureFlag] = useUpdateWorkspaceFeatureFlagMutation();

  const handleUserLookup = async (userIdentifier: string) => {
    setError(null);
    setIsLoading(true);
    setUserLookupResult(null);

    const response = await userLookup({
      variables: { userIdentifier },
    });

    return response.data?.userLookupAdminPanel;
  };

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
    userLookupResult,
    handleUserLookup,
    handleFeatureFlagUpdate,
    isLoading,
    error,
  };
};
