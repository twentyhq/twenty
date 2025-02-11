import {
    FeatureFlagKey,
    useUpdateWorkspaceFeatureFlagMutation,
} from '~/generated/graphql';

export const useFeatureFlagMutation = () => {
  const [updateFeatureFlag] = useUpdateWorkspaceFeatureFlagMutation();

  const executeFeatureFlagMutation = async (
    workspaceId: string,
    featureFlag: FeatureFlagKey,
    value: boolean,
  ) => {
    const response = await updateFeatureFlag({
      variables: {
        workspaceId,
        featureFlag,
        value,
      },
    });

    return response.data;
  };

  return { executeFeatureFlagMutation };
};
