import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { MCP_SERVER_TOOL_TABLE_BODY_MAX_HEIGHT } from '@/settings/mcp-servers/constants/McpServerToolTableBodyMaxHeight';
import { MCP_SERVER_TOOL_TABLE_ROW_GRID_TEMPLATE_COLUMNS } from '@/settings/mcp-servers/constants/McpServerToolTableRowGridTemplateColumns';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { type McpServerTool } from '~/generated-metadata/graphql';

const StyledTableBodyContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  max-height: ${MCP_SERVER_TOOL_TABLE_BODY_MAX_HEIGHT};
  overflow-y: auto;
`;

type SettingsMcpServerToolsTableProps = {
  tools: Pick<McpServerTool, 'name' | 'description'>[];
};

export const SettingsMcpServerToolsTable = ({
  tools,
}: SettingsMcpServerToolsTableProps) => {
  const { t } = useLingui();

  return (
    <Table>
      <TableRow
        gridTemplateColumns={MCP_SERVER_TOOL_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      >
        <TableHeader>{t`Name`}</TableHeader>
        <TableHeader>{t`Description`}</TableHeader>
      </TableRow>
      {isNonEmptyArray(tools) ? (
        <StyledTableBodyContainer>
          <TableBody>
            {tools.map((tool) => (
              <TableRow
                key={tool.name}
                gridTemplateColumns={
                  MCP_SERVER_TOOL_TABLE_ROW_GRID_TEMPLATE_COLUMNS
                }
              >
                <TableCell
                  color={themeCssVariables.font.color.primary}
                  overflow="hidden"
                >
                  <OverflowingTextWithTooltip text={tool.name} />
                </TableCell>
                <TableCell overflow="hidden">
                  <OverflowingTextWithTooltip text={tool.description ?? ''} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </StyledTableBodyContainer>
      ) : (
        <TableCell color={themeCssVariables.font.color.tertiary}>
          {t`No tools synced yet`}
        </TableCell>
      )}
    </Table>
  );
};
