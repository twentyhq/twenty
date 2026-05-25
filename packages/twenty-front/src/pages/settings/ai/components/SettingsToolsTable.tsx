import { styled } from '@linaria/react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useContext, useMemo, useState } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { useGetToolIndex } from '@/ai/hooks/useGetToolIndex';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { logicFunctionsSelector } from '@/logic-functions/states/logicFunctionsSelector';
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
  IconLock,
  IconPuzzle,
  IconTool,
} from 'twenty-ui/display';
import { SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { MenuItemToggle } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { ToolCategory } from 'twenty-shared/ai';
import { normalizeSearchText } from '~/utils/normalizeSearchText';
import { SettingsToolIcon } from './SettingsToolIcon';
import {
  SettingsToolTableRow,
  TOOL_TABLE_ROW_GRID_TEMPLATE_COLUMNS,
} from './SettingsToolTableRow';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

type ToolItem = {
  identifier: string;
  name: string;
  description?: string | null;
  category?: string;
  objectName?: string | null;
  icon?: string | null;
  applicationId?: string | null;
};

const FIND_MANY_APPLICATIONS_FOR_TOOL_TABLE = gql`
  query FindManyApplicationsForToolTable {
    findManyApplications {
      id
      name
      universalIdentifier
      logo
    }
  }
`;

const FIND_MANY_MARKETPLACE_APPS_FOR_TOOL_TABLE = gql`
  query FindManyMarketplaceAppsForToolTable {
    findManyMarketplaceApps {
      id
      universalIdentifier
      icon
      logo
    }
  }
`;

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
  const {
    toolIndex,
    loading: toolIndexLoading,
    error: toolIndexError,
  } = useGetToolIndex();
  const { data: applicationsData } = useQuery<{
    findManyApplications: Array<{
      id: string;
      name: string;
      universalIdentifier: string;
      logo?: string | null;
    }>;
  }>(FIND_MANY_APPLICATIONS_FOR_TOOL_TABLE);
  const { data: marketplaceAppsData } = useQuery<{
    findManyMarketplaceApps: Array<{
      id: string;
      universalIdentifier: string;
      icon: string;
      logo?: string | null;
    }>;
  }>(FIND_MANY_MARKETPLACE_APPS_FOR_TOOL_TABLE);
  const { t } = useLingui();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomTools, setShowCustomTools] = useState(true);
  const [showManagedTools, setShowManagedTools] = useState(true);
  const [showStandardTools, setShowStandardTools] = useState(true);

  const workspaceCustomApplicationId =
    currentWorkspace?.workspaceCustomApplication?.id;

  const isManaged = (applicationId?: string | null) =>
    isDefined(applicationId) && applicationId !== workspaceCustomApplicationId;

  const isCustom = (item: ToolItem) => isDefined(item.applicationId);

  const getToolLink = (item: ToolItem) =>
    getSettingsPath(SettingsPath.AiToolDetail, {
      toolIdentifier: item.identifier,
    });

  const getToolApplicationId = (item: ToolItem) => {
    if (isDefined(item.applicationId)) {
      return item.applicationId;
    }

    return (
      currentWorkspace?.installedApplications?.find(
        (app) =>
          app.universalIdentifier ===
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      )?.id ?? ''
    );
  };

  const allTools: ToolItem[] = useMemo(
    () => [
      ...logicFunctions
        .filter((fn) => isDefined(fn.toolTriggerSettings))
        .map((fn) => ({
          identifier: fn.id,
          name: fn.name,
          description: fn.description,
          applicationId: fn.applicationId,
        })),
      ...toolIndex
        .filter((tool) => tool.category !== ToolCategory.LOGIC_FUNCTION)
        .map((tool) => ({
          identifier: tool.name,
          name: tool.name,
          description: tool.description,
          category: tool.category,
          objectName: tool.objectName,
          icon: tool.icon,
        })),
    ],
    [logicFunctions, toolIndex],
  );

  const applicationById = new Map(
    (applicationsData?.findManyApplications ?? []).map((application) => [
      application.id,
      application,
    ]),
  );
  const marketplaceAppByUniversalIdentifier = new Map(
    (marketplaceAppsData?.findManyMarketplaceApps ?? []).map(
      (marketplaceApp) => [marketplaceApp.universalIdentifier, marketplaceApp],
    ),
  );

  const filteredTools = allTools
    .filter((item) => {
      const searchNormalized = normalizeSearchText(searchTerm);

      const matchesSearch =
        normalizeSearchText(item.name).includes(searchNormalized) ||
        normalizeSearchText(item.description ?? '').includes(searchNormalized);

      if (!matchesSearch) {
        return false;
      }

      if (!isCustom(item)) {
        return showStandardTools;
      }

      if (isManaged(item.applicationId)) {
        return showManagedTools;
      }

      return showCustomTools;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const showSkeleton = toolIndexLoading && !toolIndexError;

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
              <SkeletonTheme
                key={index}
                baseColor={theme.background.tertiary}
                highlightColor={theme.background.transparent.lighter}
                borderRadius={4}
              >
                <Skeleton height={32} borderRadius={4} />
              </SkeletonTheme>
            ))
          : filteredTools.map((item) => {
              const application = isDefined(item.applicationId)
                ? applicationById.get(item.applicationId)
                : undefined;
              const marketplaceApp = isDefined(application)
                ? marketplaceAppByUniversalIdentifier.get(
                    application.universalIdentifier,
                  )
                : undefined;

              return (
                <SettingsToolTableRow
                  key={item.identifier}
                  leftIcon={
                    <SettingsToolIcon
                      icon={item.icon}
                      toolName={item.name}
                      objectName={item.objectName ?? undefined}
                      application={application}
                      marketplaceApp={marketplaceApp}
                    />
                  }
                  name={item.name}
                  applicationId={getToolApplicationId(item)}
                  action={
                    <IconChevronRight
                      size={theme.icon.size.md}
                      stroke={theme.icon.stroke.sm}
                    />
                  }
                  link={getToolLink(item)}
                />
              );
            })}
      </Table>
    </Section>
  );
};
