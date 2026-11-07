import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconTrash } from 'twenty-ui/icon';
import { Status } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { MCP_SERVER_CONNECTION_TABLE_ROW_GRID_TEMPLATE_COLUMNS } from '@/settings/mcp-servers/constants/McpServerConnectionTableRowGridTemplateColumns';
import { useDeleteMcpServerConnection } from '@/settings/mcp-servers/hooks/useDeleteMcpServerConnection';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { type McpServerConnectionFragmentFragment } from '~/generated-metadata/graphql';

type SettingsMcpServerConnectionsTableProps = {
  connections: McpServerConnectionFragmentFragment[];
};

export const SettingsMcpServerConnectionsTable = ({
  connections,
}: SettingsMcpServerConnectionsTableProps) => {
  const { t } = useLingui();
  const { deleteMcpServerConnection, isDeletingMcpServerConnection } =
    useDeleteMcpServerConnection();

  return (
    <Table>
      <TableRow
        gridTemplateColumns={
          MCP_SERVER_CONNECTION_TABLE_ROW_GRID_TEMPLATE_COLUMNS
        }
      >
        <TableHeader>{t`Account`}</TableHeader>
        <TableHeader>{t`Shared with`}</TableHeader>
        <TableHeader>{t`Status`}</TableHeader>
        <TableHeader />
      </TableRow>
      <TableBody>
        {connections.map((connection) => (
          <TableRow
            key={connection.id}
            gridTemplateColumns={
              MCP_SERVER_CONNECTION_TABLE_ROW_GRID_TEMPLATE_COLUMNS
            }
          >
            <TableCell
              color={themeCssVariables.font.color.primary}
              overflow="hidden"
            >
              <OverflowingTextWithTooltip text={connection.handle} />
            </TableCell>
            <TableCell>
              {connection.scope === 'WORKSPACE' ? t`Workspace` : t`Only you`}
            </TableCell>
            <TableCell>
              {isDefined(connection.authFailedAt) ? (
                <Status color="red" weight="medium">{t`Sign in again`}</Status>
              ) : (
                <Status color="green" weight="medium">{t`Connected`}</Status>
              )}
            </TableCell>
            <TableCell align="right">
              <LightIconButton
                emphasis="subtle"
                aria-label={t`Disconnect ${connection.handle}`}
                disabled={isDeletingMcpServerConnection}
                onClick={() => deleteMcpServerConnection(connection.id)}
              >
                <IconTrash />
              </LightIconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
