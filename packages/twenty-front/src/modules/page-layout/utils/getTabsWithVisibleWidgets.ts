import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { buildWidgetVisibilityContext } from '@/page-layout/utils/buildWidgetVisibilityContext';
import { filterVisibleWidgets } from '@/page-layout/utils/filterVisibleWidgets';

type GetTabsWithVisibleWidgetsParams = {
  tabs: PageLayoutTab[];
  isMobile: boolean;
  isInRightDrawer: boolean;
  isEditMode: boolean;
};

export const getTabsWithVisibleWidgets = ({
  tabs,
  isMobile,
  isInRightDrawer,
  isEditMode,
}: GetTabsWithVisibleWidgetsParams): PageLayoutTab[] => {
  if (isEditMode) {
    return tabs;
  }

  const context = buildWidgetVisibilityContext({ isMobile, isInRightDrawer });

  return tabs.map((tab) => ({
    ...tab,
    widgets: filterVisibleWidgets({ widgets: tab.widgets, context }),
  }));
};
