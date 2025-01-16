import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';
import {
  FeatureFlag,
  FeatureFlagKey,
  useGetLabsPublicFeatureFlagsQuery,
  useUpdateLabsPublicFeatureFlagMutation,
} from '~/generated/graphql';

export const useLabsPublicFeatureFlags = () => {
  const [labsPublicFeatureFlags, setLabsPublicFeatureFlags] = useState<
    FeatureFlag[]
  >([]);
  const { loading: labsPublicFeatureFlagsLoading } =
    useGetLabsPublicFeatureFlagsQuery({
      fetchPolicy: 'cache-and-network',
      onCompleted: (data) => {
        setLabsPublicFeatureFlags(data.getLabsPublicFeatureFlags);
      },
    });
  const [error, setError] = useState<string | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const [updateLabsPublicFeatureFlag] =
    useUpdateLabsPublicFeatureFlagMutation();

  const handleLabsPublicFeatureFlagUpdate = async (
    workspaceId: string,
    publicFeatureFlag: FeatureFlagKey,
    value: boolean,
  ) => {
    setError(null);
    const previousState = labsPublicFeatureFlags;
    const previousWorkspace = currentWorkspace;

    if (isDefined(labsPublicFeatureFlags)) {
      const updatedFlags = labsPublicFeatureFlags.map((flag) =>
        flag.key === publicFeatureFlag ? { ...flag, value } : flag,
      );
      setLabsPublicFeatureFlags(updatedFlags);
    }

    if (isDefined(currentWorkspace)) {
      setCurrentWorkspace({
        ...currentWorkspace,
        featureFlags: currentWorkspace.featureFlags?.map((flag) =>
          flag.key === publicFeatureFlag ? { ...flag, value } : flag,
        ),
      });
    }
    const response = await updateLabsPublicFeatureFlag({
      variables: {
        workspaceId,
        publicFeatureFlag,
        value,
      },
      onError: (error) => {
        if (isDefined(previousState)) {
          setLabsPublicFeatureFlags(previousState);
        }
        if (isDefined(previousWorkspace)) {
          setCurrentWorkspace(previousWorkspace);
        }
        setError(error.message);
      },
    });

    return !!response.data;
  };

  return {
    labsPublicFeatureFlags,
    labsPublicFeatureFlagsLoading,
    handleLabsPublicFeatureFlagUpdate,
    error,
  };
};
