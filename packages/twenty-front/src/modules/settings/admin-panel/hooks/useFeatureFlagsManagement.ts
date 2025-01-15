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

  const updateFeatureFlags = async (
    workspaceId: string,
    featureFlag: FeatureFlagKey,
    updateData: { value?: boolean; isPublic?: boolean },
  ) => {
    setError(null);
    const previousUserLookupResult = userLookupResult;
    const previousWorkspace = currentWorkspace;

    if (isDefined(userLookupResult)) {
      setUserLookupResult({
        ...userLookupResult,
        workspaces: userLookupResult.workspaces.map((workspace) =>
          workspace.id === workspaceId
            ? {
                ...workspace,
                featureFlags: workspace.featureFlags.map((flag) =>
                  flag.key === featureFlag ? { ...flag, ...updateData } : flag,
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
            flag.key === featureFlag ? { ...flag, ...updateData } : flag,
          ),
        };
      });
    }

    const currentValue = userLookupResult?.workspaces
      .find((w) => w.id === workspaceId)
      ?.featureFlags.find((f) => f.key === featureFlag)?.value;

    const response = await updateFeatureFlag({
      variables: {
        workspaceId,
        featureFlag,
        value: updateData.value ?? currentValue ?? false,
        isPublic: updateData.isPublic ?? false,
      },
      onError: (error) => {
        if (isDefined(previousUserLookupResult)) {
          setUserLookupResult(previousUserLookupResult);
        }
        if (isDefined(previousWorkspace)) {
          setCurrentWorkspace(previousWorkspace);
        }
        setError(error.message);
      },
    });

    return !!response.data;
  };

  const updateFeatureFlagValue = (
    workspaceId: string,
    featureFlag: FeatureFlagKey,
    value: boolean,
  ) => updateFeatureFlags(workspaceId, featureFlag, { value });

  const updateFeatureFlagIsPublic = (
    workspaceId: string,
    featureFlag: FeatureFlagKey,
    isPublic: boolean,
  ) => updateFeatureFlags(workspaceId, featureFlag, { isPublic });

  return {
    userLookupResult,
    handleUserLookup,
    updateFeatureFlagValue,
    updateFeatureFlagIsPublic,
    isLoading,
    error,
  };
};
