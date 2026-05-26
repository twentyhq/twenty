import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { frontComponentsSelector } from '@/front-components/states/frontComponentsSelector';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { pageLayoutsWithRelationsSelector } from '@/page-layout/states/pageLayoutsWithRelationsSelector';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsLayoutManageItemsTable } from '@/settings/layout/components/SettingsLayoutManageItemsTable';
import { type LayoutItemRow } from '@/settings/layout/types/LayoutItemRow';
import { type LayoutItemTabId } from '@/settings/layout/types/LayoutItemTabId';
import { getPageLayoutTypeLabel } from '@/settings/layout/utils/getPageLayoutTypeLabel';
import { getStandardApplicationId } from '@/settings/layout/utils/getStandardApplicationId';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  IconAppWindow,
  IconCommand,
  type IconComponent,
  IconLayoutSidebarLeftExpand,
  IconPuzzle,
  IconTable,
} from 'twenty-ui/display';
import { SearchInput } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const SETTINGS_LAYOUT_MANAGE_ITEMS_TABS_ID =
  'settings-layout-manage-items-tabs';

const StyledToolbar = styled.div`
  display: flex;
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

type TabDescriptor = {
  id: LayoutItemTabId;
  title: string;
  searchPlaceholder: string;
  Icon: IconComponent;
  rows: LayoutItemRow[];
  secondaryColumn?: 'object' | 'type';
};

export const SettingsLayoutManageItems = () => {
  const { t } = useLingui();
  const [activeTabId, setActiveTabId] = useState<LayoutItemTabId>('commands');
  const [searchTerm, setSearchTerm] = useState('');

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const standardApplicationId = getStandardApplicationId(currentWorkspace);

  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);
  const navigationMenuItems = useAtomStateValue(navigationMenuItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const pageLayoutsWithRelations = useAtomStateValue(
    pageLayoutsWithRelationsSelector,
  );
  const frontComponents = useAtomStateValue(frontComponentsSelector);
  const { findObjectMetadataItemById } = useFilteredObjectMetadataItems();

  const tabs: TabDescriptor[] = useMemo(() => {
    const resolveObjectSecondary = (
      objectMetadataId: string | null | undefined,
    ) => {
      if (objectMetadataId === null || objectMetadataId === undefined) {
        return undefined;
      }
      const objectMetadataItem = findObjectMetadataItemById(objectMetadataId);
      if (objectMetadataItem === undefined) {
        return undefined;
      }
      return {
        kind: 'object' as const,
        label: objectMetadataItem.labelPlural,
        icon: objectMetadataItem.icon ?? undefined,
      };
    };

    return [
      {
        id: 'commands',
        title: t`Commands`,
        searchPlaceholder: t`Search a command...`,
        Icon: IconCommand,
        rows: commandMenuItems.map((item) => ({
          id: item.id,
          name: item.label,
          icon: item.icon ?? undefined,
          to: getSettingsPath(SettingsPath.LayoutManageItemCommandDetail, {
            commandMenuItemId: item.id,
          }),
        })),
      },
      {
        id: 'sidebar',
        title: t`Sidebar`,
        searchPlaceholder: t`Search a sidebar item...`,
        Icon: IconLayoutSidebarLeftExpand,
        rows: navigationMenuItems.map((item) => ({
          id: item.id,
          name: item.name ?? t`Untitled`,
          icon: item.icon ?? undefined,
          applicationId: item.applicationId,
          to: getSettingsPath(SettingsPath.LayoutManageItemSidebarItemDetail, {
            sidebarItemId: item.id,
          }),
        })),
      },
      {
        id: 'views',
        title: t`Views`,
        searchPlaceholder: t`Search a view...`,
        Icon: IconTable,
        rows: views.map((view) => ({
          id: view.id,
          name: view.name,
          icon: view.icon,
          secondary: resolveObjectSecondary(view.objectMetadataId),
          to: getSettingsPath(SettingsPath.LayoutManageItemViewDetail, {
            viewId: view.id,
          }),
        })),
        secondaryColumn: 'object',
      },
      {
        id: 'pages',
        title: t`Pages`,
        searchPlaceholder: t`Search a page...`,
        Icon: IconAppWindow,
        rows: pageLayoutsWithRelations.map((page) => ({
          id: page.id,
          name: page.name,
          secondary: { kind: 'type', label: getPageLayoutTypeLabel(page.type) },
          to: getSettingsPath(SettingsPath.LayoutManageItemPageLayoutDetail, {
            pageLayoutId: page.id,
          }),
        })),
        secondaryColumn: 'type',
      },
      {
        id: 'front-components',
        title: t`Front components`,
        searchPlaceholder: t`Search a front component...`,
        Icon: IconPuzzle,
        rows: frontComponents.map((frontComponent) => ({
          id: frontComponent.id,
          name: frontComponent.name,
          applicationId: frontComponent.applicationId,
          to: getSettingsPath(
            SettingsPath.LayoutManageItemFrontComponentDetail,
            { frontComponentId: frontComponent.id },
          ),
        })),
      },
    ];
  }, [
    commandMenuItems,
    navigationMenuItems,
    views,
    pageLayoutsWithRelations,
    frontComponents,
    findObjectMetadataItemById,
    t,
  ]);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (normalizedSearch === '') {
      return activeTab.rows;
    }
    return activeTab.rows.filter((row) =>
      row.name.toLowerCase().includes(normalizedSearch),
    );
  }, [activeTab.rows, searchTerm]);

  return (
    <SubMenuTopBarContainer
      title={t`Manage layout items`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: <Trans>Layout</Trans>,
          href: getSettingsPath(SettingsPath.Layout),
        },
        { children: <Trans>Manage layout items</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <TabList
          tabs={tabs.map(({ id, title, Icon }) => ({ id, title, Icon }))}
          behaveAsLinks={false}
          componentInstanceId={SETTINGS_LAYOUT_MANAGE_ITEMS_TABS_ID}
          onChangeTab={(tabId) => setActiveTabId(tabId as LayoutItemTabId)}
        />
        <StyledToolbar>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={activeTab.searchPlaceholder}
            filterDropdown={(filterButton) => filterButton}
          />
        </StyledToolbar>
        <SettingsLayoutManageItemsTable
          rows={filteredRows}
          fallbackApplicationId={standardApplicationId}
          secondaryColumn={activeTab.secondaryColumn}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
