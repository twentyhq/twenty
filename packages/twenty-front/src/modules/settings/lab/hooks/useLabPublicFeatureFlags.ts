import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';
import {
  FeatureFlag,
  FeatureFlagKey,
  useGetLabPublicFeatureFlagsQuery,
  useUpdateLabPublicFeatureFlagMutation,
} from '~/generated/graphql';

export const useLabPublicFeatureFlags = () => {
  const [labPublicFeatureFlags, setLabPublicFeatureFlags] = useState<
    FeatureFlag[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const { loading: labPublicFeatureFlagsLoading } =
    useGetLabPublicFeatureFlagsQuery({
      variables: {
        workspaceId: currentWorkspace?.id,
      },
      skip: !currentWorkspace?.id,
      fetchPolicy: 'cache-and-network',
      onCompleted: (data) => {
        setLabPublicFeatureFlags(data.getLabPublicFeatureFlags);
      },
    });

  const [updateLabPublicFeatureFlag] = useUpdateLabPublicFeatureFlagMutation();

  const handleLabPublicFeatureFlagUpdate = async (
    publicFeatureFlag: FeatureFlagKey,
    value: boolean,
  ) => {
    setError(null);
    const previousState = labPublicFeatureFlags;
    const previousWorkspace = currentWorkspace;

    if (isDefined(labPublicFeatureFlags)) {
      const updatedFlags = labPublicFeatureFlags.map((flag) =>
        flag.key === publicFeatureFlag ? { ...flag, value } : flag,
      );
      setLabPublicFeatureFlags(updatedFlags);
    }

    if (isDefined(currentWorkspace)) {
      setCurrentWorkspace({
        ...currentWorkspace,
        featureFlags: currentWorkspace.featureFlags?.map((flag) =>
          flag.key === publicFeatureFlag ? { ...flag, value } : flag,
        ),
      });
    }
    const response = await updateLabPublicFeatureFlag({
      variables: {
        workspaceId: currentWorkspace?.id,
        publicFeatureFlag,
        value,
      },
      onError: (error) => {
        if (isDefined(previousState)) {
          setLabPublicFeatureFlags(previousState);
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
    labPublicFeatureFlags,
    labPublicFeatureFlagsLoading,
    handleLabPublicFeatureFlagUpdate,
    error,
  };
};
