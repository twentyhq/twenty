import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useContext, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import { useGetToolIndex } from '@/ai/hooks/useGetToolIndex';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { logicFunctionsSelector } from '@/logic-functions/states/logicFunctionsSelector';
import { type LogicFunction } from '@/logic-functions/types/LogicFunction';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  H2Title,
  IconChevronRight,
  IconCode,
  IconLock,
  IconPuzzle,
  IconTool,
} from 'twenty-ui/display';
import { SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { MenuItemToggle } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { normalizeSearchText } from '~/utils/normalizeSearchText';
import {
  SettingsSystemToolTableRow,
  type SystemTool,
} from './SettingsSystemToolTableRow';
import {
  SettingsToolTableRow,
  TOOL_TABLE_ROW_GRID_TEMPLATE_COLUMNS,
} from './SettingsToolTableRow';

type CustomToolItem = { kind: 'custom'; tool: LogicFunction };
type SystemToolItem = { kind: 'system'; tool: SystemTool };

const StyledSearchContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledTableHeaderRowContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

export const SettingsToolsTable = () => {
  const { theme } = useContext(ThemeContext);
  const logicFunctions = useAtomStateValue(logicFunctionsSelector);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { toolIndex, loading: toolIndexLoading } = useGetToolIndex();
  const { t } = useLingui();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomTools, setShowCustomTools] = useState(true);
  const [showManagedTools, setShowManagedTools] = useState(true);
  const [showStandardTools, setShowStandardTools] = useState(true);

  const workspaceCustomApplicationId =
    currentWorkspace?.workspaceCustomApplication?.id;

  const isManaged = (applicationId?: string | null) =>
    isDefined(applicationId) && applicationId !== workspaceCustomApplicationId;

  const getToolLink = (tool: LogicFunction) => {
    const applicationId = (tool as { applicationId?: string }).applicationId;
    if (isDefined(applicationId)) {
      return getSettingsPath(SettingsPath.ApplicationLogicFunctionDetail, {
        applicationId,
        logicFunctionId: tool.id,
      });
    }
    return getSettingsPath(SettingsPath.LogicFunctionDetail, {
      logicFunctionId: tool.id,
    });
  };

  const customTools: CustomToolItem[] = logicFunctions
    .filter((fn) => fn.isTool === true)
    .map((tool) => ({ kind: 'custom', tool }));

  const systemTools: SystemToolItem[] = toolIndex
    .filter((systemTool) => systemTool.category !== 'LOGIC_FUNCTION')
    .map((tool) => ({ kind: 'system', tool }));

  const filteredTools = [...customTools, ...systemTools]
    .filter((item) => {
      const searchNormalized = normalizeSearchText(searchTerm);

      const matchesSearch =
        normalizeSearchText(item.tool.name).includes(searchNormalized) ||
        normalizeSearchText(item.tool.description ?? '').includes(
          searchNormalized,
        );

      if (!matchesSearch) {
        return false;
      }

      if (item.kind === 'system') {
        return showStandardTools;
      }

      if (isManaged(item.tool.applicationId)) {
        return showManagedTools;
      }

      return showCustomTools;
    })
    .sort((a, b) => a.tool.name.localeCompare(b.tool.name));

  const showSkeleton = toolIndexLoading;

  return (
    <Section>
      <H2Title
        title={t`Tools`}
        description={t`Use filter to see existing tools or create your own`}
      />
      <StyledSearchContainer>
        <SearchInput
          placeholder={t`Search a tool...`}
          value={searchTerm}
          onChange={setSearchTerm}
          filterDropdown={(filterButton: ReactNode) => (
            <Dropdown
              dropdownId="settings-tools-filter-dropdown"
              dropdownPlacement="bottom-end"
              dropdownOffset={{ x: 0, y: 8 }}
              clickableComponent={filterButton}
              dropdownComponents={
                <DropdownContent>
                  <DropdownMenuItemsContainer>
                    <MenuItemToggle
                      LeftIcon={IconTool}
                      onToggleChange={() =>
                        setShowCustomTools(!showCustomTools)
                      }
                      toggled={showCustomTools}
                      text={t`Custom`}
                      toggleSize="small"
                    />
                    <MenuItemToggle
                      LeftIcon={IconLock}
                      onToggleChange={() =>
                        setShowManagedTools(!showManagedTools)
                      }
                      toggled={showManagedTools}
                      text={t`Managed`}
                      toggleSize="small"
                    />
                    <MenuItemToggle
                      LeftIcon={IconPuzzle}
                      onToggleChange={() =>
                        setShowStandardTools(!showStandardTools)
                      }
                      toggled={showStandardTools}
                      text={t`Standard`}
                      toggleSize="small"
                    />
                  </DropdownMenuItemsContainer>
                </DropdownContent>
              }
            />
          )}
        />
      </StyledSearchContainer>
      <Table>
        <StyledTableHeaderRowContainer>
          <TableRow gridTemplateColumns={TOOL_TABLE_ROW_GRID_TEMPLATE_COLUMNS}>
            <TableHeader>{t`Name`}</TableHeader>
            <TableHeader>{t`App`}</TableHeader>
            <TableHeader />
          </TableRow>
        </StyledTableHeaderRowContainer>
        {showSkeleton
          ? Array.from({ length: 3 }).map((_, index) => (
              <Skeleton height={32} borderRadius={4} key={index} />
            ))
          : filteredTools.map((item) =>
              item.kind === 'custom' ? (
                <SettingsToolTableRow
                  key={item.tool.id}
                  LeftIcon={IconCode}
                  name={item.tool.name}
                  isCustom={true}
                  applicationId={item.tool.applicationId}
                  action={
                    <IconChevronRight
                      size={theme.icon.size.md}
                      stroke={theme.icon.stroke.sm}
                    />
                  }
                  link={getToolLink(item.tool)}
                />
              ) : (
                <SettingsSystemToolTableRow
                  key={item.tool.name}
                  tool={item.tool}
                />
              ),
            )}
      </Table>
    </Section>
  );
};
