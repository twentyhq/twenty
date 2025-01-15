import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { UserLookup } from '@/settings/admin-panel/types/UserLookup';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';
import {
  FeatureFlagKey,
  useUpdateWorkspaceFeatureFlagMutation,
  useUserLookupAdminPanelMutation,
} from '~/generated/graphql';

export const useFeatureFlagsManagement = () => {
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
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
    refetchQueries: ['GetCurrentUser'],
  });

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
    isPublic?: boolean,
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
                  flag.key === featureFlag
                    ? { ...flag, value, isPublic: isPublic ?? flag.isPublic }
                    : flag,
                ),
              }
            : workspace,
        ),
      });
    }

    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspace((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          featureFlags: prev.featureFlags?.map((flag) =>
            flag.key === featureFlag
              ? { ...flag, value, isPublic: isPublic ?? flag.isPublic }
              : flag,
          ),
        };
      });
    }

    const response = await updateFeatureFlag({
      variables: {
        workspaceId,
        featureFlag,
        value,
        isPublic,
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
