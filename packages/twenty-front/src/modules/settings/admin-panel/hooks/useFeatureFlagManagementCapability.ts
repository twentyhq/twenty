import { useQuery } from '@apollo/client';
import { GET_FEATURE_FLAG_MANAGEMENT_CAPABILITY } from '../graphql/queries/getFeatureFlagManagementCapability';

export const useFeatureFlagManagementCapability = () => {
  const { data, loading } = useQuery(GET_FEATURE_FLAG_MANAGEMENT_CAPABILITY);

  return {
    canManageFeatureFlags: data?.getFeatureFlagManagementCapability ?? false,
    isLoading: loading,
  };
};
