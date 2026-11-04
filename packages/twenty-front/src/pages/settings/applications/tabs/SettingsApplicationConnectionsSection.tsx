import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { SettingsApplicationAddConnectionButton } from '@/settings/applications/components/SettingsApplicationAddConnectionButton';
import { SettingsApplicationConnectionProviderSection } from '@/settings/applications/components/SettingsApplicationConnectionProviderSection';
import { SettingsApplicationConnectionName } from '@/settings/applications/components/SettingsApplicationConnectionName';
import { SettingsApplicationConnectionStatus } from '@/settings/applications/components/SettingsApplicationConnectionStatus';
import { SettingsApplicationConnectionTableRows } from '@/settings/applications/components/SettingsApplicationConnectionTableRows';
import { canStartConnectionProviderAuthorization } from '@/settings/applications/utils/canStartConnectionProviderAuthorization';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { IconChevronRight } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
import { useApplicationConnectedAccounts } from '~/pages/settings/applications/hooks/useApplicationConnectedAccounts';
import { useFindApplicationConnectionProviders } from '~/pages/settings/applications/hooks/useFindApplicationConnectionProviders';

const CONNECTION_TABLE_ROW_GRID_TEMPLATE_COLUMNS = 'minmax(0, 1fr) 160px 36px';

export const SettingsApplicationConnectionsSection = ({
  applicationId,
}: {
  applicationId: string;
}) => {
  const { t } = useLingui();
  const theme = useTheme();
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
        if (provider.scope !== 'WORKSPACE') {
          return null;
        }

        const canStartAuthorization =
          canStartConnectionProviderAuthorization(provider);
        const providerConnections = connectedAccounts.filter(
          (account) => account.connectionProviderId === provider.id,
        );

        return (
          <SettingsApplicationConnectionProviderSection
            key={provider.id}
            providerDisplayName={provider.displayName}
            providerLogoUrl={provider.logoUrl}
            description={t`Manage connections used by this app to call ${provider.displayName}.`}
            shouldShowMissingCredentialsBanner={!canStartAuthorization}
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
                        <SettingsApplicationConnectionName
                          connection={connection}
                        />
                      </TableCell>
                      <TableCell clickable>
                        <SettingsApplicationConnectionStatus
                          connection={connection}
                        />
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
            {canStartAuthorization && (
              <SettingsApplicationAddConnectionButton
                applicationId={applicationId}
                providerName={provider.name}
              />
            )}
          </SettingsApplicationConnectionProviderSection>
        );
      })}
    </>
  );
};
