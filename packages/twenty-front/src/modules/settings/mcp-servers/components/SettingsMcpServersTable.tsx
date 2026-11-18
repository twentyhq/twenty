import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { MCP_SERVER_TABLE_BODY_MAX_HEIGHT } from '@/settings/mcp-servers/constants/McpServerTableBodyMaxHeight';
import { MCP_SERVER_TABLE_ROW_GRID_TEMPLATE_COLUMNS } from '@/settings/mcp-servers/constants/McpServerTableRowGridTemplateColumns';
import { SettingsMcpServerTableRow } from '@/settings/mcp-servers/components/SettingsMcpServerTableRow';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { FindManyMcpServersDocument } from '~/generated-metadata/graphql';

const StyledTableBodyContainer = styled.div`
  max-height: ${MCP_SERVER_TABLE_BODY_MAX_HEIGHT};
  overflow-y: auto;
`;

export const SettingsMcpServersTable = () => {
  const { t } = useLingui();
  const { data, loading, error } = useQuery(FindManyMcpServersDocument);

  const mcpServers = data?.mcpServers ?? [];
  const hasMcpServers = isNonEmptyArray(mcpServers);
  const isEmpty = !loading && !hasMcpServers;

  return (
    <Table>
      <ToastOnQueryErrorEffect
        error={error}
        message={t`Failed to load MCP servers`}
      />
      <TableRow
        gridTemplateColumns={MCP_SERVER_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      >
        <TableHeader>{t`Label`}</TableHeader>
        <TableHeader>{t`URL`}</TableHeader>
        <TableHeader>{t`Status`}</TableHeader>
        <TableHeader></TableHeader>
      </TableRow>
      {hasMcpServers && (
        <StyledTableBodyContainer>
          <TableBody>
            {mcpServers.map((mcpServer) => (
              <SettingsMcpServerTableRow
                key={mcpServer.id}
                mcpServer={mcpServer}
                to={getSettingsPath(SettingsPath.AiMcpServerDetail, {
                  mcpServerId: mcpServer.id,
                })}
              />
            ))}
          </TableBody>
        </StyledTableBodyContainer>
      )}
      {isEmpty && (
        <TableCell color={themeCssVariables.font.color.tertiary}>
          {t`No MCP servers yet`}
        </TableCell>
      )}
    </Table>
  );
};
