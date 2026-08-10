import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { buildWidgetVisibilityContext } from '@/page-layout/utils/buildWidgetVisibilityContext';
import { filterVisibleWidgets } from '@/page-layout/utils/filterVisibleWidgets';

type GetTabsWithVisibleWidgetsParams = {
  tabs: PageLayoutTab[];
  isMobile: boolean;
  isInSidePanel: boolean;
  isEditMode: boolean;
  selectedRecords?: Record<string, unknown>[];
};

export const getTabsWithVisibleWidgets = ({
  tabs,
  isMobile,
  isInSidePanel,
  isEditMode,
  selectedRecords,
}: GetTabsWithVisibleWidgetsParams): PageLayoutTab[] => {
  const activeTabs = tabs.filter((tab) => tab.isActive);

  if (isEditMode) {
    return activeTabs;
  }

  const context = buildWidgetVisibilityContext({
    isMobile,
    isInSidePanel,
    selectedRecords,
  });

  const tabsWithFilteredWidgets = activeTabs.map((tab) => ({
    ...tab,
    widgets: filterVisibleWidgets({ widgets: tab.widgets, context }),
  }));

  const tabsWithVisibleWidgets = tabsWithFilteredWidgets.filter(
    (tab) => tab.widgets.length > 0,
  );

  if (tabsWithVisibleWidgets.length === 0 && activeTabs.length > 0) {
    return tabsWithFilteredWidgets.slice(0, 1);
  }

  return tabsWithVisibleWidgets;
};
