import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import {
  FeatureFlagKey,
  MyAppPreferencesApplicationVariablesDocument,
} from '~/generated-metadata/graphql';

export const useMyAppPreferencesApplicationVariables = (
  applicationUniversalIdentifier: string | undefined,
) => {
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const { data, loading, error, refetch } = useQuery(
    MyAppPreferencesApplicationVariablesDocument,
    {
      variables: {
        applicationUniversalIdentifier: applicationUniversalIdentifier ?? '',
      },
      skip:
        !isAppPreferencesEnabled || !isDefined(applicationUniversalIdentifier),
    },
  );

  return {
    applicationVariables: data?.myAppPreferencesApplicationVariables ?? [],
    hasLoaded: isDefined(data),
    loading,
    error,
    refetch,
  };
};
