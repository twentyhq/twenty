import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';
import { filterVisibleWidgets } from '@/page-layout/utils/filterVisibleWidgets';
import { isPageLayoutTabHiddenByFeatureFlags } from '@/page-layout/utils/isPageLayoutTabHiddenByFeatureFlags';
import { isWidgetEnabledByFeatureFlags } from '@/page-layout/utils/isWidgetEnabledByFeatureFlags';

type GetTabsWithVisibleWidgetsParams = {
  tabs: PageLayoutTab[];
  isEditMode: boolean;
  context: WidgetVisibilityContext;
};

export const getTabsWithVisibleWidgets = ({
  tabs,
  isEditMode,
  context,
}: GetTabsWithVisibleWidgetsParams): PageLayoutTab[] => {
  const activeTabs = tabs.filter((tab) => tab.isActive);

  if (isEditMode) {
    return activeTabs
      .filter(
        (tab) =>
          !isPageLayoutTabHiddenByFeatureFlags({
            tab,
            featureFlags: context.featureFlags,
          }),
      )
      .map((tab) => ({
        ...tab,
        widgets: tab.widgets.filter((widget) =>
          isWidgetEnabledByFeatureFlags({
            widget,
            featureFlags: context.featureFlags,
          }),
        ),
      }));
  }

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
