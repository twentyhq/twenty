import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconChevronRight } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { SettingsToolIcon } from '~/pages/settings/ai/components/SettingsToolIcon';
import {
  SettingsToolTableRow,
  TOOL_TABLE_ROW_GRID_TEMPLATE_COLUMNS,
} from '~/pages/settings/ai/components/SettingsToolTableRow';
import { type SettingsAgentToolItem } from '~/pages/settings/ai/types/SettingsAgentToolItem';
import { getToolApplicationId } from '~/pages/settings/ai/utils/getToolApplicationId';
import { getToolLink } from '~/pages/settings/ai/utils/getToolLink';

type SettingsAgentToolsTableProps = {
  tools: SettingsAgentToolItem[];
  isLoading: boolean;
  currentWorkspace: CurrentWorkspace | null;
};

const StyledTableHeaderRowContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

export const SettingsAgentToolsTable = ({
  tools,
  isLoading,
  currentWorkspace,
}: SettingsAgentToolsTableProps) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();

  return (
    <Table>
      <StyledTableHeaderRowContainer>
        <TableRow gridTemplateColumns={TOOL_TABLE_ROW_GRID_TEMPLATE_COLUMNS}>
          <TableHeader>{t`Name`}</TableHeader>
          <TableHeader>{t`App`}</TableHeader>
          <TableHeader />
        </TableRow>
      </StyledTableHeaderRowContainer>
      {isLoading
        ? Array.from({ length: 3 }).map((_, index) => (
            <SkeletonTheme
              key={index}
              baseColor={theme.background.tertiary}
              highlightColor={theme.background.transparent.lighter}
              borderRadius={4}
            >
              <Skeleton height={32} borderRadius={4} />
            </SkeletonTheme>
          ))
        : tools.map((tool) => (
            <SettingsToolTableRow
              key={tool.identifier}
              leftIcon={
                <SettingsToolIcon
                  icon={tool.icon}
                  toolName={tool.name}
                  objectName={tool.objectName ?? undefined}
                />
              }
              name={tool.label ?? tool.name}
              applicationId={getToolApplicationId(tool, currentWorkspace)}
              action={
                <IconChevronRight
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                  color={theme.font.color.tertiary}
                />
              }
              link={getToolLink(tool)}
            />
          ))}
    </Table>
  );
};
