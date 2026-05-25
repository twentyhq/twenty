import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { buildWidgetVisibilityContext } from '@/page-layout/utils/buildWidgetVisibilityContext';
import { filterVisibleWidgets } from '@/page-layout/utils/filterVisibleWidgets';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const useIsCurrentWidgetLastOfTab = (widgetId: string): boolean => {
  const { currentPageLayout } = useCurrentPageLayout();
  const isMobile = useIsMobile();
  const { isInSidePanel } = useLayoutRenderingContext();
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

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
        context: buildWidgetVisibilityContext({ isMobile, isInSidePanel }),
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
