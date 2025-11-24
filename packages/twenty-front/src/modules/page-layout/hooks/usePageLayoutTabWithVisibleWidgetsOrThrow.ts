import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { buildWidgetVisibilityContext } from '@/page-layout/utils/buildWidgetVisibilityContext';
import { filterVisibleWidgets } from '@/page-layout/utils/filterVisibleWidgets';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const usePageLayoutTabWithVisibleWidgetsOrThrow = (
  tabId: string,
): PageLayoutTab => {
  const { currentPageLayout } = useCurrentPageLayout();
  const isMobile = useIsMobile();
  const { isInRightDrawer } = useLayoutRenderingContext();
  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  if (!isDefined(currentPageLayout)) {
    throw new Error('currentPageLayout is not defined');
  }

  const tab = currentPageLayout.tabs.find((t) => t.id === tabId);

  if (!isDefined(tab)) {
    throw new Error('Tab not found');
  }

  if (isPageLayoutInEditMode) {
    return tab;
  }

  const context = buildWidgetVisibilityContext({ isMobile, isInRightDrawer });

  return {
    ...tab,
    widgets: filterVisibleWidgets({ widgets: tab.widgets, context }),
  };
};
