import { UserLookup } from '@/settings/admin-panel/types/UserLookup';
import { useState } from 'react';
import { isDefined } from 'twenty-ui';
import {
  useUpdateWorkspaceFeatureFlagMutation,
  useUserLookupAdminPanelMutation,
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

  const [updateFeatureFlag] = useUpdateWorkspaceFeatureFlagMutation({
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleUserLookup = async (userIdentifier: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await userLookup({
        variables: { userIdentifier },
      });

      return response.data?.userLookupAdminPanel;
    } catch {
      return null;
    }
  };

  const handleFeatureFlagUpdate = async (
    workspaceId: string,
    featureFlag: string,
    value: boolean,
  ) => {
    setError(null);

    const previousState = userLookupResult;

    try {
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

      await updateFeatureFlag({
        variables: {
          workspaceId,
          featureFlag,
          value,
        },
      });

      return true;
    } catch (err) {
      if (isDefined(previousState)) {
        setUserLookupResult(previousState);
      }
      return false;
    }
  };

  return {
    userLookupResult,
    handleUserLookup,
    handleFeatureFlagUpdate,
    isLoading,
    error,
  };
};
