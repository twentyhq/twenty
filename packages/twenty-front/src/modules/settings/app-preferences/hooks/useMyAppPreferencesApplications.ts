import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useQuery } from '@apollo/client/react';
import {
  FeatureFlagKey,
  MyAppPreferencesApplicationsDocument,
} from '~/generated-metadata/graphql';

export const useMyAppPreferencesApplications = () => {
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const { data, loading, error, refetch } = useQuery(
    MyAppPreferencesApplicationsDocument,
    { skip: !isAppPreferencesEnabled },
  );

  return {
    applications: isAppPreferencesEnabled
      ? (data?.myAppPreferencesApplications ?? [])
      : [],
    loading,
    error,
    refetch,
    isAppPreferencesEnabled,
  };
};
