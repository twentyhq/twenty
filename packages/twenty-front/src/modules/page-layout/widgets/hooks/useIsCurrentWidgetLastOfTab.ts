import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { useWidgetVisibilityContext } from '@/page-layout/hooks/useWidgetVisibilityContext';
import { filterVisibleWidgets } from '@/page-layout/utils/filterVisibleWidgets';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const useIsCurrentWidgetLastOfTab = (widgetId: string): boolean => {
  const { currentPageLayout } = useCurrentPageLayout();
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const widgetVisibilityContext = useWidgetVisibilityContext();

  if (!isDefined(currentPageLayout)) {
    return false;
  }

  const tab = currentPageLayout.tabs.find((tab) =>
    tab.widgets.some((widget) => widget.id === widgetId),
  );

  if (!isDefined(tab)) {
    return false;
  }

  const filteredWidgets = isPageLayoutInEditMode
    ? tab.widgets
    : filterVisibleWidgets({
        widgets: tab.widgets,
        context: widgetVisibilityContext,
      });

  const visibleWidgets =
    tab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
      ? sortWidgetsByVerticalListPosition(filteredWidgets)
      : filteredWidgets;

  if (visibleWidgets.length === 0) {
    return false;
  }

  const lastWidget = visibleWidgets.at(-1);

  return lastWidget?.id === widgetId;
};
