import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { usePageLayoutTabsFilteredByFeatureFlags } from '@/page-layout/hooks/usePageLayoutTabsFilteredByFeatureFlags';
import { useWidgetVisibilityContext } from '@/page-layout/hooks/useWidgetVisibilityContext';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { filterVisibleWidgets } from '@/page-layout/utils/filterVisibleWidgets';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const usePageLayoutTabWithVisibleWidgetsOrThrow = (
  tabId: string,
): PageLayoutTab => {
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const { featureFilteredPageLayoutTabs } =
    usePageLayoutTabsFilteredByFeatureFlags();
  const widgetVisibilityContext = useWidgetVisibilityContext();

  const tab = featureFilteredPageLayoutTabs.find((tab) => tab.id === tabId);

  if (!isDefined(tab)) {
    throw new Error('Tab not found');
  }

  const activeWidgets = tab.widgets.filter((widget) => widget.isActive);

  if (isPageLayoutInEditMode) {
    return {
      ...tab,
      widgets:
        tab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
          ? sortWidgetsByVerticalListPosition(activeWidgets)
          : activeWidgets,
    };
  }

  const visibleWidgets = filterVisibleWidgets({
    widgets: activeWidgets,
    context: widgetVisibilityContext,
  });

  return {
    ...tab,
    widgets:
      tab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
        ? sortWidgetsByVerticalListPosition(visibleWidgets)
        : visibleWidgets,
  };
};
