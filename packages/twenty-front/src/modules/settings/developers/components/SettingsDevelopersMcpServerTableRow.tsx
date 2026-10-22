import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { MCP_SERVER_TABLE_ROW_GRID_TEMPLATE_COLUMNS } from '@/settings/developers/constants/McpServerTableRowGridTemplateColumns';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { getUrlHostnameOrThrow, isValidUrl } from 'twenty-shared/utils';
import { IconChevronRight } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { type McpServer } from '~/generated-metadata/graphql';

const StyledIconChevronRightContainer = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
`;

type SettingsDevelopersMcpServerTableRowProps = {
  mcpServer: Pick<McpServer, 'id' | 'label' | 'url' | 'isEnabled'> & {
    tools: Pick<McpServer['tools'][number], 'name'>[];
  };
  to: string;
};

export const SettingsDevelopersMcpServerTableRow = ({
  mcpServer,
  to,
}: SettingsDevelopersMcpServerTableRowProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const toolCount = mcpServer.tools.length;
  const status = mcpServer.isEnabled
    ? toolCount === 1
      ? t`1 tool`
      : t`${toolCount} tools`
    : t`Disabled`;

  return (
    <TableRow
      gridTemplateColumns={MCP_SERVER_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      to={to}
    >
      <TableCell color={themeCssVariables.font.color.primary} overflow="hidden">
        <OverflowingTextWithTooltip text={mcpServer.label} />
      </TableCell>
      <TableCell
        color={themeCssVariables.font.color.tertiary}
        overflow="hidden"
      >
        <OverflowingTextWithTooltip
          text={
            isValidUrl(mcpServer.url)
              ? getUrlHostnameOrThrow(mcpServer.url)
              : mcpServer.url
          }
        />
      </TableCell>
      <TableCell
        color={themeCssVariables.font.color.tertiary}
        overflow="hidden"
      >
        <OverflowingTextWithTooltip text={status} />
      </TableCell>
      <TableCell
        align="center"
        padding={`0 ${themeCssVariables.spacing[1]} 0 0`}
      >
        <StyledIconChevronRightContainer>
          <IconChevronRight
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        </StyledIconChevronRightContainer>
      </TableCell>
    </TableRow>
  );
};
