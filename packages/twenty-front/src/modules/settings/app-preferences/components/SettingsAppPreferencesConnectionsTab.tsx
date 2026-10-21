import { SettingsAppPreferencesDisconnectConnectionDialog } from '@/settings/app-preferences/components/SettingsAppPreferencesDisconnectConnectionDialog';
import { useMyPersonalConnectedAccounts } from '@/settings/app-preferences/hooks/useMyPersonalConnectedAccounts';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { getApplicationPreferencesConnectionsPath } from '@/settings/app-preferences/utils/getApplicationPreferencesConnectionsPath';
import { SettingsApplicationAddConnectionButton } from '@/settings/applications/components/SettingsApplicationAddConnectionButton';
import { SettingsApplicationConnectionProviderSection } from '@/settings/applications/components/SettingsApplicationConnectionProviderSection';
import { SettingsApplicationConnectionStatus } from '@/settings/applications/components/SettingsApplicationConnectionStatus';
import { SettingsApplicationConnectionTableRows } from '@/settings/applications/components/SettingsApplicationConnectionTableRows';
import { useTriggerAppOAuth } from '@/settings/applications/hooks/useTriggerAppOAuth';
import { isApplicationConnectionReconnectNeeded } from '@/settings/applications/utils/isApplicationConnectionReconnectNeeded';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { IconRefresh, IconUnlink } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const APP_CONNECTED_ACCOUNT_PROVIDERS: ReadonlySet<ConnectedAccountProvider> =
  new Set([ConnectedAccountProvider.APP]);

const CONNECTION_TABLE_ROW_GRID_TEMPLATE_COLUMNS = 'minmax(0, 1fr) 160px 220px';

const StyledRowActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
`;

const StyledEmptyState = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
`;

const getDisconnectDialogId = (connectedAccountId: string) =>
  `disconnect-app-connection-modal-${connectedAccountId}`;

type SettingsAppPreferencesConnectionsTabProps = {
  applicationId: string;
  connectionProviders: ApplicationWithPreferences['connectionProviders'];
};

export const SettingsAppPreferencesConnectionsTab = ({
  applicationId,
  connectionProviders,
}: SettingsAppPreferencesConnectionsTabProps) => {
  const { t } = useLingui();
  const { triggerAppOAuth } = useTriggerAppOAuth();
  const { openDialog } = useDialog();
  const { accounts: personalAccounts, loading } =
    useMyPersonalConnectedAccounts({
      providers: APP_CONNECTED_ACCOUNT_PROVIDERS,
    });

  if (loading) {
    return null;
  }

  const redirectLocation =
    getApplicationPreferencesConnectionsPath(applicationId);

  return (
    <>
      {connectionProviders.map((provider) => {
        const isClientCredentialsConfigured =
          provider.oauth?.isClientCredentialsConfigured ?? false;

        const providerConnections = personalAccounts.filter(
          (account) => account.connectionProviderId === provider.id,
        );

        return (
          <SettingsApplicationConnectionProviderSection
            key={provider.id}
            provider={provider}
            description={t`Connect your own ${provider.displayName} account for this app to use on your behalf.`}
            shouldShowMissingCredentialsBanner
          >
            {providerConnections.length === 0 ? (
              isClientCredentialsConfigured && (
                <StyledEmptyState>{t`You have no ${provider.displayName} connection yet.`}</StyledEmptyState>
              )
            ) : (
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
                    >
                      <TableCell
                        color={themeCssVariables.font.color.primary}
                        minWidth="0"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {connection.name ?? connection.handle}
                      </TableCell>
                      <TableCell>
                        <SettingsApplicationConnectionStatus
                          connection={connection}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <StyledRowActions>
                          {isClientCredentialsConfigured &&
                            isApplicationConnectionReconnectNeeded(
                              connection,
                            ) && (
                              <Button
                                startIcon={<IconRefresh />}
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  triggerAppOAuth({
                                    applicationId,
                                    providerName: provider.name,
                                    scope: 'USER',
                                    reconnectingConnectedAccountId:
                                      connection.id,
                                    redirectLocation,
                                  })
                                }
                              >{t`Reconnect`}</Button>
                            )}
                          <Button
                            startIcon={<IconUnlink />}
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              openDialog(getDisconnectDialogId(connection.id))
                            }
                          >{t`Disconnect`}</Button>
                        </StyledRowActions>
                        <SettingsAppPreferencesDisconnectConnectionDialog
                          dialogId={getDisconnectDialogId(connection.id)}
                          connectedAccountId={connection.id}
                          connectionLabel={connection.name ?? connection.handle}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </SettingsApplicationConnectionTableRows>
              </Table>
            )}
            {isClientCredentialsConfigured && (
              <SettingsApplicationAddConnectionButton
                applicationId={applicationId}
                providerName={provider.name}
                scope="USER"
                redirectLocation={redirectLocation}
              />
            )}
          </SettingsApplicationConnectionProviderSection>
        );
      })}
    </>
  );
};
