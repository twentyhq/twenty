import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useQuery } from '@apollo/client/react';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  FeatureFlagKey,
  MyAppPreferencesConnectedAccountsDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const useMyAppPreferencesConnectedAccounts = () => {
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const canManageConnectedAccounts = useHasPermissionFlag(
    PermissionFlagType.CONNECTED_ACCOUNTS,
  );
  const { data, loading, error, refetch } = useQuery(
    MyAppPreferencesConnectedAccountsDocument,
    { skip: !isAppPreferencesEnabled || !canManageConnectedAccounts },
  );

  return {
    accounts:
      isAppPreferencesEnabled && canManageConnectedAccounts
        ? (data?.myConnectedAccounts.filter(
            (account) =>
              account.provider === ConnectedAccountProvider.APP &&
              isDefined(account.applicationId) &&
              isDefined(account.connectionProviderId),
          ) ?? [])
        : [],
    loading,
    error,
    refetch,
    canManageConnectedAccounts,
  };
};
