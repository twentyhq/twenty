import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { useWidgetVisibilityContext } from '@/page-layout/hooks/useWidgetVisibilityContext';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { filterVisibleWidgets } from '@/page-layout/utils/filterVisibleWidgets';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const usePageLayoutTabWithVisibleWidgetsOrThrow = (
  tabId: string,
): PageLayoutTab => {
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const widgetVisibilityContext = useWidgetVisibilityContext();

  const tab = currentPageLayout.tabs.find((tab) => tab.id === tabId);

  // Memoized because consumers feed this widget array to dnd-kit and to
  // memoized callbacks, which a fresh array on every render would defeat.
  const tabWithVisibleWidgets = useMemo(() => {
    if (!isDefined(tab)) {
      return undefined;
    }

    const activeWidgets = tab.widgets.filter((widget) => widget.isActive);

    const widgets = isPageLayoutInEditMode
      ? activeWidgets
      : filterVisibleWidgets({
          widgets: activeWidgets,
          context: widgetVisibilityContext,
        });

    return {
      ...tab,
      widgets:
        tab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
          ? sortWidgetsByVerticalListPosition(widgets)
          : widgets,
    };
  }, [isPageLayoutInEditMode, tab, widgetVisibilityContext]);

  if (!isDefined(tabWithVisibleWidgets)) {
    throw new Error('Tab not found');
  }

  return tabWithVisibleWidgets;
};
