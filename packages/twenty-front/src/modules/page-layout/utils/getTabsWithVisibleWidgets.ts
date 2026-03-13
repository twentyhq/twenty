import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { buildWidgetVisibilityContext } from '@/page-layout/utils/buildWidgetVisibilityContext';
import { filterVisibleWidgets } from '@/page-layout/utils/filterVisibleWidgets';

type GetTabsWithVisibleWidgetsParams = {
  tabs: PageLayoutTab[];
  isMobile: boolean;
  isInSidePanel: boolean;
  isEditMode: boolean;
  recordFieldValues?: Record<string, unknown>;
};

export const getTabsWithVisibleWidgets = ({
  tabs,
  isMobile,
  isInSidePanel,
  isEditMode,
  recordFieldValues,
}: GetTabsWithVisibleWidgetsParams): PageLayoutTab[] => {
  if (isEditMode) {
    return tabs;
  }

  const context = buildWidgetVisibilityContext({
    isMobile,
    isInSidePanel,
    recordFieldValues,
  });

  const tabsWithFilteredWidgets = tabs.map((tab) => ({
    ...tab,
    widgets: filterVisibleWidgets({ widgets: tab.widgets, context }),
  }));

  const tabsWithVisibleWidgets = tabsWithFilteredWidgets.filter(
    (tab) => tab.widgets.length > 0,
  );

  if (tabsWithVisibleWidgets.length === 0 && tabs.length > 0) {
    return tabsWithFilteredWidgets.slice(0, 1);
  }

  return tabsWithVisibleWidgets;
};
