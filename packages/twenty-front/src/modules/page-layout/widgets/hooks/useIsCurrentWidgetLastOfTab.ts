import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { buildWidgetVisibilityContext } from '@/page-layout/utils/buildWidgetVisibilityContext';
import { filterVisibleWidgets } from '@/page-layout/utils/filterVisibleWidgets';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const useIsCurrentWidgetLastOfTab = (widgetId: string): boolean => {
  const { currentPageLayout } = useCurrentPageLayout();
  const isMobile = useIsMobile();
  const { isInRightDrawer } = useLayoutRenderingContext();
  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  if (!isDefined(currentPageLayout)) {
    return false;
  }

  const tab = currentPageLayout.tabs.find((tab) =>
    tab.widgets.some((widget) => widget.id === widgetId),
  );

  if (!isDefined(tab)) {
    return false;
  }

  const visibleWidgets = isPageLayoutInEditMode
    ? tab.widgets
    : filterVisibleWidgets({
        widgets: tab.widgets,
        context: buildWidgetVisibilityContext({ isMobile, isInRightDrawer }),
      });

  if (visibleWidgets.length === 0) {
    return false;
  }

  const lastWidget = visibleWidgets.at(-1);

  return lastWidget?.id === widgetId;
};
