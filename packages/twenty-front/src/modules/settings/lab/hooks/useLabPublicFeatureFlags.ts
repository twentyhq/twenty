import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { labPublicFeatureFlagsState } from '@/client-config/states/labPublicFeatureFlagsState';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  type FeatureFlagKey,
  useUpdateLabPublicFeatureFlagMutation,
} from '~/generated-metadata/graphql';

export const useLabPublicFeatureFlags = () => {
  const [error, setError] = useState<string | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const labPublicFeatureFlags = useRecoilValue(labPublicFeatureFlagsState);

  const [updateLabPublicFeatureFlag] = useUpdateLabPublicFeatureFlagMutation({
    onCompleted: (data) => {
      if (isDefined(currentWorkspace)) {
        const updatedFlag = data.updateLabPublicFeatureFlag;

        setCurrentWorkspace({
          ...currentWorkspace,
          featureFlags: [
            ...(currentWorkspace.featureFlags?.filter(
              (flag) => flag.key !== updatedFlag.key,
            ) ?? []),
            {
              ...updatedFlag,
            },
          ],
        });
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleLabPublicFeatureFlagUpdate = async (
    publicFeatureFlag: FeatureFlagKey,
    value: boolean,
  ) => {
    if (!isDefined(currentWorkspace)) {
      setError(t`No workspace selected`);
      return false;
    }

    setError(null);

    const response = await updateLabPublicFeatureFlag({
      variables: {
        input: {
          publicFeatureFlag,
          value,
        },
      },
    });

    return !!response.data;
  };

  return {
    labPublicFeatureFlags: labPublicFeatureFlags.map((flag) => ({
      ...flag,
      value:
        currentWorkspace?.featureFlags?.find(
          (workspaceFlag) => workspaceFlag.key === flag.key,
        )?.value ?? false,
    })),
    handleLabPublicFeatureFlagUpdate,
    error,
  };
};
