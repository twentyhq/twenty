import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAppPreferencesDisconnectConnectionDialog } from '@/settings/app-preferences/components/SettingsAppPreferencesDisconnectConnectionDialog';
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
import { IconRefresh, IconUnlink } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const CONNECTION_TABLE_ROW_GRID_TEMPLATE_COLUMNS = 'minmax(0, 1fr) 160px 220px';

const StyledRowActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
`;

const getDisconnectDialogId = (connectedAccountId: string) =>
  `disconnect-app-connection-modal-${connectedAccountId}`;

type SettingsAppPreferencesConnectionsTableProps = {
  applicationId: string;
  providerName: string;
  connections: ConnectedAccount[];
  isClientCredentialsConfigured: boolean;
  redirectLocation: string;
};

export const SettingsAppPreferencesConnectionsTable = ({
  applicationId,
  providerName,
  connections,
  isClientCredentialsConfigured,
  redirectLocation,
}: SettingsAppPreferencesConnectionsTableProps) => {
  const { t } = useLingui();
  const { triggerAppOAuth } = useTriggerAppOAuth();
  const { openDialog } = useDialog();

  return (
    <Table>
      <TableRow
        gridTemplateColumns={CONNECTION_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      >
        <TableHeader>{t`Connection`}</TableHeader>
        <TableHeader>{t`Status`}</TableHeader>
        <TableHeader />
      </TableRow>
      <SettingsApplicationConnectionTableRows>
        {connections.map((connection) => (
          <TableRow
            key={connection.id}
            gridTemplateColumns={CONNECTION_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
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
              <SettingsApplicationConnectionStatus connection={connection} />
            </TableCell>
            <TableCell align="right">
              <StyledRowActions>
                {isClientCredentialsConfigured &&
                  isApplicationConnectionReconnectNeeded(connection) && (
                    <Button
                      startIcon={<IconRefresh />}
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        triggerAppOAuth({
                          applicationId,
                          providerName,
                          scope: 'USER',
                          reconnectingConnectedAccountId: connection.id,
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
  );
};
