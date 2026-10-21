import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { SettingsApplicationAddConnectionButton } from '@/settings/applications/components/SettingsApplicationAddConnectionButton';
import { SettingsApplicationConnectionProviderSection } from '@/settings/applications/components/SettingsApplicationConnectionProviderSection';
import { SettingsApplicationConnectionStatus } from '@/settings/applications/components/SettingsApplicationConnectionStatus';
import { SettingsApplicationConnectionTableRows } from '@/settings/applications/components/SettingsApplicationConnectionTableRows';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { IconChevronRight } from 'twenty-ui/icon';
import { Status } from 'twenty-ui/primitives/data-display';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { useApplicationConnectedAccounts } from '~/pages/settings/applications/hooks/useApplicationConnectedAccounts';
import { useFindApplicationConnectionProviders } from '~/pages/settings/applications/hooks/useFindApplicationConnectionProviders';

const CONNECTION_TABLE_ROW_GRID_TEMPLATE_COLUMNS =
  'minmax(0, 1fr) 160px 180px 36px';

export const SettingsApplicationConnectionsSection = ({
  applicationId,
}: {
  applicationId: string;
}) => {
  const { t } = useLingui();
  const theme = useTheme();
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const hasConnectedAccountsPermission = useHasPermissionFlag(
    PermissionFlagType.CONNECTED_ACCOUNTS,
  );
  // App preferences requires CONNECTED_ACCOUNTS, so without it personal connections stay listed here
  const isPersonalConnectionManagedInAppPreferences =
    isAppPreferencesEnabled && hasConnectedAccountsPermission;
  const { connectionProviders, loading } =
    useFindApplicationConnectionProviders(applicationId);
  const { accounts: connectedAccounts, loading: accountsLoading } =
    useApplicationConnectedAccounts(applicationId);

  if (loading || accountsLoading || connectionProviders.length === 0) {
    return null;
  }

  return (
    <>
      {connectionProviders.map((provider) => {
        const isClientCredentialsConfigured =
          provider.oauth?.isClientCredentialsConfigured ?? false;
        const canAddConnection = provider.scope === 'WORKSPACE';

        const providerConnections = connectedAccounts.filter(
          (account) =>
            account.connectionProviderId === provider.id &&
            (!isPersonalConnectionManagedInAppPreferences ||
              account.scope === 'WORKSPACE'),
        );

        if (!canAddConnection && providerConnections.length === 0) {
          return null;
        }

        return (
          <SettingsApplicationConnectionProviderSection
            key={provider.id}
            providerDisplayName={provider.displayName}
            providerLogoUrl={provider.logoUrl}
            isClientCredentialsConfigured={isClientCredentialsConfigured}
            description={t`Manage connections used by this app to call ${provider.displayName}.`}
            shouldShowMissingCredentialsBanner={canAddConnection}
          >
            {providerConnections.length > 0 && (
              <Table>
                <TableRow
                  gridTemplateColumns={
                    CONNECTION_TABLE_ROW_GRID_TEMPLATE_COLUMNS
                  }
                >
                  <TableHeader>{t`Connection`}</TableHeader>
                  <TableHeader>{t`Status`}</TableHeader>
                  <TableHeader>{t`Visibility`}</TableHeader>
                  <TableHeader />
                </TableRow>
                <SettingsApplicationConnectionTableRows>
                  {providerConnections.map((connection) => (
                    <TableRow
                      key={connection.id}
                      gridTemplateColumns={
                        CONNECTION_TABLE_ROW_GRID_TEMPLATE_COLUMNS
                      }
                      to={getSettingsPath(
                        SettingsPath.ApplicationConnectionDetail,
                        {
                          applicationId,
                          connectedAccountId: connection.id,
                        },
                      )}
                    >
                      <TableCell
                        color={themeCssVariables.font.color.primary}
                        clickable
                        minWidth="0"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {connection.name ?? connection.handle}
                      </TableCell>
                      <TableCell clickable>
                        <SettingsApplicationConnectionStatus
                          connection={connection}
                        />
                      </TableCell>
                      <TableCell clickable>
                        <Status
                          color={
                            connection.scope === 'WORKSPACE' ? 'blue' : 'gray'
                          }
                        >
                          {connection.scope === 'WORKSPACE'
                            ? t`Workspace shared`
                            : t`Just for me`}
                        </Status>
                      </TableCell>
                      <TableCell
                        align="right"
                        color={themeCssVariables.font.color.tertiary}
                        padding={`0 ${themeCssVariables.spacing[2]} 0 0`}
                      >
                        <IconChevronRight
                          size={theme.icon.size.md}
                          stroke={theme.icon.stroke.sm}
                          color={theme.font.color.light}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </SettingsApplicationConnectionTableRows>
              </Table>
            )}
            {canAddConnection && isClientCredentialsConfigured && (
              <SettingsApplicationAddConnectionButton
                applicationId={applicationId}
                providerName={provider.name}
                scope="WORKSPACE"
              />
            )}
          </SettingsApplicationConnectionProviderSection>
        );
      })}
    </>
  );
};
