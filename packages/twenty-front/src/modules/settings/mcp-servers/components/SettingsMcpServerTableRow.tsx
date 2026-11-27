import { getUrlSafely } from 'twenty-shared/utils';
import { IconChevronRight } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { MCP_SERVER_TABLE_ROW_GRID_TEMPLATE_COLUMNS } from '@/settings/mcp-servers/constants/McpServerTableRowGridTemplateColumns';
import { SettingsMcpServerStatus } from '@/settings/mcp-servers/components/SettingsMcpServerStatus';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { type McpServerFragmentFragment } from '~/generated-metadata/graphql';

type SettingsMcpServerTableRowProps = {
  mcpServer: Pick<
    McpServerFragmentFragment,
    'label' | 'url' | 'isActive' | 'toolsSyncError' | 'tools'
  >;
  to: string;
};

export const SettingsMcpServerTableRow = ({
  mcpServer,
  to,
}: SettingsMcpServerTableRowProps) => {
  const theme = useTheme();

  return (
    <TableRow
      gridTemplateColumns={MCP_SERVER_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      to={to}
    >
      <TableCell color={themeCssVariables.font.color.primary} overflow="hidden">
        <OverflowingTextWithTooltip text={mcpServer.label} />
      </TableCell>
      <TableCell overflow="hidden">
        <OverflowingTextWithTooltip
          text={getUrlSafely(mcpServer.url)?.hostname ?? mcpServer.url}
        />
      </TableCell>
      <TableCell>
        <SettingsMcpServerStatus mcpServer={mcpServer} />
      </TableCell>
      <TableCell
        align="center"
        padding={`0 ${themeCssVariables.spacing[1]} 0 0`}
      >
        <IconChevronRight
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={theme.font.color.tertiary}
        />
      </TableCell>
    </TableRow>
  );
};
