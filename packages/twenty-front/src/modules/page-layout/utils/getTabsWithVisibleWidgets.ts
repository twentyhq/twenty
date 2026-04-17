import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { buildWidgetVisibilityContext } from '@/page-layout/utils/buildWidgetVisibilityContext';
import { filterVisibleWidgets } from '@/page-layout/utils/filterVisibleWidgets';

type GetTabsWithVisibleWidgetsParams = {
  tabs: PageLayoutTab[];
  isMobile: boolean;
  isInSidePanel: boolean;
  isEditMode: boolean;
  // recordFieldValues feeds record field data into the widget visibility context,
  // enabling pageLayoutWidget.conditionalDisplay json-logic rules to reference
  // record values (e.g. show/hide an entire widget based on salesStage).
  // PageLayoutRendererContent reads this from the Jotai record store and passes
  // it here. The infrastructure is in place but not currently used for any
  // active widget-level rules — field-level conditional visibility for
  // Opportunity fields is handled separately in useOpportunityConditionalFields.
  recordFieldValues?: Record<string, unknown>;
};

export const getTabsWithVisibleWidgets = ({
  tabs,
  isMobile,
  isInSidePanel,
  isEditMode,
  recordFieldValues,
}: GetTabsWithVisibleWidgetsParams): PageLayoutTab[] => {
  const activeTabs = tabs.filter((tab) => tab.isActive);

  if (isEditMode) {
    return activeTabs;
  }

  const context = buildWidgetVisibilityContext({
    isMobile,
    isInSidePanel,
    recordFieldValues,
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
