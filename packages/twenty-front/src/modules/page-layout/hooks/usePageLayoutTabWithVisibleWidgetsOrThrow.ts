import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { buildWidgetVisibilityContext } from '@/page-layout/utils/buildWidgetVisibilityContext';
import { filterVisibleWidgets } from '@/page-layout/utils/filterVisibleWidgets';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const usePageLayoutTabWithVisibleWidgetsOrThrow = (
  tabId: string,
): PageLayoutTab => {
  const { currentPageLayout } = useCurrentPageLayout();
  const isMobile = useIsMobile();
  const { isInSidePanel } = useLayoutRenderingContext();
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  if (!isDefined(currentPageLayout)) {
    throw new Error('currentPageLayout is not defined');
  }

  const tab = currentPageLayout.tabs.find((t) => t.id === tabId);

  if (!isDefined(tab)) {
    throw new Error('Tab not found');
  }

  if (isPageLayoutInEditMode) {
    return {
      ...tab,
      widgets:
        tab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
          ? sortWidgetsByVerticalListPosition(tab.widgets)
          : tab.widgets,
    };
  }

  const context = buildWidgetVisibilityContext({ isMobile, isInSidePanel });

  const visibleWidgets = filterVisibleWidgets({
    widgets: tab.widgets,
    context,
  });

  return {
    ...tab,
    widgets:
      tab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
        ? sortWidgetsByVerticalListPosition(visibleWidgets)
        : visibleWidgets,
  };
};
