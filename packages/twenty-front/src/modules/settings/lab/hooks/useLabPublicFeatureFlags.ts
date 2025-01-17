import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { labPublicFeatureFlagsState } from '@/client-config/states/labPublicFeatureFlagsState';
import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';
import {
  FeatureFlagKey,
  useUpdateLabPublicFeatureFlagMutation,
} from '~/generated/graphql';

export const useLabPublicFeatureFlags = () => {
  const [error, setError] = useState<string | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const labPublicFeatureFlags = useRecoilValue(labPublicFeatureFlagsState);
 
  const [updateLabPublicFeatureFlag] = useUpdateLabPublicFeatureFlagMutation();

  const handleLabPublicFeatureFlagUpdate = async (
    publicFeatureFlag: FeatureFlagKey,
    value: boolean,
  ) => {
    if (!isDefined(currentWorkspace)) {
      setError('No workspace selected');
      return false;
    }

    setError(null);
    const previousWorkspace = currentWorkspace;

    setCurrentWorkspace({
      ...currentWorkspace,
      featureFlags: currentWorkspace.featureFlags?.map((flag) =>
        flag.key === publicFeatureFlag ? { ...flag, value } : flag,
      ),
    });

    const response = await updateLabPublicFeatureFlag({
      variables: {
        workspaceId: currentWorkspace.id,
        publicFeatureFlag,
        value,
      },
      onError: (error) => {
        if (isDefined(previousWorkspace)) {
          setCurrentWorkspace(previousWorkspace);
        }
        setError(error.message);
      },
    });

    return !!response.data;
  };

  return {
    labPublicFeatureFlags: labPublicFeatureFlags.map((flag) => ({
      ...flag,
      value: currentWorkspace?.featureFlags?.find(
        (workspaceFlag) => workspaceFlag.key === flag.key
      )?.value ?? false,
    })),
    handleLabPublicFeatureFlagUpdate,
    error,
  };
};