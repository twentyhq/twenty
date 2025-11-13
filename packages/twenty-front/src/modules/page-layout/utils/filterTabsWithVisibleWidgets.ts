import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { buildWidgetVisibilityContext } from '@/page-layout/utils/buildWidgetVisibilityContext';
import { filterVisibleWidgets } from '@/page-layout/utils/filterVisibleWidgets';

type FilterTabsWithVisibleWidgetsParams = {
  tabs: PageLayoutTab[];
  isMobile: boolean;
  isInRightDrawer: boolean;
  isEditMode: boolean;
};

export const filterTabsWithVisibleWidgets = ({
  tabs,
  isMobile,
  isInRightDrawer,
  isEditMode,
}: FilterTabsWithVisibleWidgetsParams): PageLayoutTab[] => {
  const context = buildWidgetVisibilityContext({ isMobile, isInRightDrawer });

  return tabs
    .map((tab) => ({
      ...tab,
      widgets: filterVisibleWidgets({ widgets: tab.widgets, context }),
    }))
    .filter((tab) => {
      if (isEditMode) {
        return true;
      }
      return tab.widgets.length > 0;
    });
};
