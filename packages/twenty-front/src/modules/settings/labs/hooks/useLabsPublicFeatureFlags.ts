import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { labsFeatureFlagsState } from '@/settings/labs/states/labsFeatureFlagsState';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';
import {
    FeatureFlagKey,
    useGetLabsPublicFeatureFlagsQuery,
    useUpdateLabsPublicFeatureFlagMutation,
} from '~/generated/graphql';

export const useLabsPublicFeatureFlags = () => {
  const [labsFeatureFlags, setLabsFeatureFlags] = useRecoilState(
    labsFeatureFlagsState,
  );
  const { loading: labsFlagsLoading } = useGetLabsPublicFeatureFlagsQuery({
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      setLabsFeatureFlags(data.getLabsPublicFeatureFlags);
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
    const previousState = labsFeatureFlags;
    const previousWorkspace = currentWorkspace;

    if (isDefined(labsFeatureFlags)) {
      const updatedFlags = labsFeatureFlags.map((flag) =>
        flag.key === publicFeatureFlag ? { ...flag, value } : flag,
      );
      setLabsFeatureFlags(updatedFlags);
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
          setLabsFeatureFlags(previousState);
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
    data: { getLabsPublicFeatureFlags: labsFeatureFlags },

    loading: labsFlagsLoading,
    handleLabsPublicFeatureFlagUpdate,
    error,
  };
};
