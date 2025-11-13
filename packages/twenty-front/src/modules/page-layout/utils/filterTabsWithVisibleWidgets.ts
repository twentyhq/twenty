import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';
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
  const context: WidgetVisibilityContext = {
    device: isMobile || isInRightDrawer ? 'MOBILE' : 'DESKTOP',
  };

  return tabs
    .map((tab) => ({
      ...tab,
      widgets: filterVisibleWidgets(tab.widgets, context),
    }))
    .filter((tab) => {
      if (isEditMode) {
        return true;
      }
      return tab.widgets.length > 0;
    });
};
