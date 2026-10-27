import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAppPreferencesConnectionRowDropdownMenu } from '@/settings/app-preferences/components/SettingsAppPreferencesConnectionRowDropdownMenu';
import { SettingsApplicationConnectionName } from '@/settings/applications/components/SettingsApplicationConnectionName';
import { SettingsApplicationConnectionStatus } from '@/settings/applications/components/SettingsApplicationConnectionStatus';
import { SettingsApplicationConnectionTableRows } from '@/settings/applications/components/SettingsApplicationConnectionTableRows';
import { SettingsTableRowsSkeletonLoader } from '@/settings/components/SettingsTableRowsSkeletonLoader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

const CONNECTION_TABLE_ROW_GRID_TEMPLATE_COLUMNS = `minmax(0, 1fr) auto ${themeCssVariables.spacing[8]}`;

type SettingsAppPreferencesConnectionsTableProps = {
  applicationId: string;
  providerName: string;
  connections: ConnectedAccount[];
  isClientCredentialsConfigured: boolean;
  isLoading: boolean;
};

export const SettingsAppPreferencesConnectionsTable = ({
  applicationId,
  providerName,
  connections,
  isClientCredentialsConfigured,
  isLoading,
}: SettingsAppPreferencesConnectionsTableProps) => {
  const { t } = useLingui();

  return (
    <Table>
      <TableRow
        gridTemplateColumns={CONNECTION_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      >
        <TableHeader>{t`Connection`}</TableHeader>
        <TableHeader>{t`Status`}</TableHeader>
        <TableHeader />
      </TableRow>
      {isLoading ? (
        <SettingsTableRowsSkeletonLoader
          gridTemplateColumns={CONNECTION_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
          columns={[{}, { width: 96 }, { align: 'right', width: 24 }]}
        />
      ) : (
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
                <SettingsApplicationConnectionName connection={connection} />
              </TableCell>
              <TableCell whiteSpace="nowrap">
                <SettingsApplicationConnectionStatus connection={connection} />
              </TableCell>
              <TableCell align="right">
                <SettingsAppPreferencesConnectionRowDropdownMenu
                  applicationId={applicationId}
                  providerName={providerName}
                  connection={connection}
                  isClientCredentialsConfigured={isClientCredentialsConfigured}
                />
              </TableCell>
            </TableRow>
          ))}
        </SettingsApplicationConnectionTableRows>
      )}
    </Table>
  );
};
