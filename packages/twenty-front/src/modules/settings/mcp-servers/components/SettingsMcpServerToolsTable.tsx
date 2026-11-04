import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { MCP_SERVER_TOOL_TABLE_ROW_GRID_TEMPLATE_COLUMNS } from '@/settings/mcp-servers/constants/McpServerToolTableRowGridTemplateColumns';
import { getMcpServerToolAnnotationBadges } from '@/settings/mcp-servers/utils/getMcpServerToolAnnotationBadges';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { type McpServerTool } from '~/generated-metadata/graphql';

const StyledTableBodyContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  max-height: 400px;
  overflow-y: auto;
`;

const StyledEmptyState = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

type SettingsMcpServerToolsTableProps = {
  tools: Pick<McpServerTool, 'name' | 'description' | 'annotations'>[];
};

export const SettingsMcpServerToolsTable = ({
  tools,
}: SettingsMcpServerToolsTableProps) => {
  const { t } = useLingui();

  if (!isNonEmptyArray(tools)) {
    return <StyledEmptyState>{t`No tools synced yet.`}</StyledEmptyState>;
  }

  return (
    <Table>
      <TableRow
        gridTemplateColumns={MCP_SERVER_TOOL_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      >
        <TableHeader>{t`Name`}</TableHeader>
        <TableHeader>{t`Description`}</TableHeader>
        <TableHeader>{t`Annotations`}</TableHeader>
      </TableRow>
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
              <TableCell>
                <StyledBadges>
                  {getMcpServerToolAnnotationBadges(tool.annotations).map(
                    (badge) => (
                      <Status key={badge.key} color={badge.color}>
                        {badge.label}
                      </Status>
                    ),
                  )}
                </StyledBadges>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </StyledTableBodyContainer>
    </Table>
  );
};
