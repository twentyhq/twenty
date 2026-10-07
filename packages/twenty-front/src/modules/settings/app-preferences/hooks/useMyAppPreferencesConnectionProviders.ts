import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useQuery } from '@apollo/client/react';
import {
  ApplicationConnectionProvidersDocument,
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const useMyAppPreferencesConnectionProviders = (
  applicationId: string,
) => {
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const canManageConnectedAccounts = useHasPermissionFlag(
    PermissionFlagType.CONNECTED_ACCOUNTS,
  );
  const { data, loading, error, refetch } = useQuery(
    ApplicationConnectionProvidersDocument,
    {
      variables: { applicationId },
      skip: !isAppPreferencesEnabled || !canManageConnectedAccounts,
    },
  );

  return {
    connectionProviders: data?.applicationConnectionProviders ?? [],
    loading,
    error,
    refetch,
  };
};
