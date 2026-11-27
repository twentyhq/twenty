import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';
import { filterVisibleWidgets } from '@/page-layout/utils/filterVisibleWidgets';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';

type GetTabsWithVisibleWidgetsParams = {
  tabs: PageLayoutTab[];
  isEditMode: boolean;
  context: WidgetVisibilityContext;
  fields?: ValidationRuleFieldDescriptor[];
};

export const getTabsWithVisibleWidgets = ({
  tabs,
  isEditMode,
  context,
  fields,
}: GetTabsWithVisibleWidgetsParams): PageLayoutTab[] => {
  const activeTabs = tabs.filter((tab) => tab.isActive);

  if (isEditMode) {
    return activeTabs;
  }

  const tabsWithFilteredWidgets = activeTabs.map((tab) => ({
    ...tab,
    widgets: filterVisibleWidgets({ widgets: tab.widgets, context, fields }),
  }));

  const tabsWithVisibleWidgets = tabsWithFilteredWidgets.filter(
    (tab) => tab.widgets.length > 0,
  );

  if (tabsWithVisibleWidgets.length === 0 && activeTabs.length > 0) {
    return tabsWithFilteredWidgets.slice(0, 1);
  }

  return tabsWithVisibleWidgets;
};
