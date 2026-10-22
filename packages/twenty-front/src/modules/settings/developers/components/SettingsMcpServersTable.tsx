import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { SettingsDevelopersMcpServerTableRow } from '@/settings/developers/components/SettingsDevelopersMcpServerTableRow';
import { MCP_SERVER_TABLE_ROW_GRID_TEMPLATE_COLUMNS } from '@/settings/developers/constants/McpServerTableRowGridTemplateColumns';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useQuery } from '@apollo/client/react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { GetMcpServersDocument } from '~/generated-metadata/graphql';

const StyledTableBodyContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  max-height: 260px;
  overflow-y: auto;
`;

export const SettingsMcpServersTable = () => {
  const { data: mcpServersData } = useQuery(GetMcpServersDocument);

  const mcpServers = mcpServersData?.mcpServers;

  return (
    <Table>
      <TableRow
        gridTemplateColumns={MCP_SERVER_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      >
        <TableHeader>{t`Name`}</TableHeader>
        <TableHeader>{t`Host`}</TableHeader>
        <TableHeader>{t`Status`}</TableHeader>
        <TableHeader></TableHeader>
      </TableRow>
      {!!mcpServers?.length && (
        <StyledTableBodyContainer>
          <TableBody>
            {mcpServers.map((mcpServer) => (
              <SettingsDevelopersMcpServerTableRow
                key={mcpServer.id}
                mcpServer={mcpServer}
                to={getSettingsPath(SettingsPath.McpServerDetail, {
                  mcpServerId: mcpServer.id,
                })}
              />
            ))}
          </TableBody>
        </StyledTableBodyContainer>
      )}
    </Table>
  );
};
