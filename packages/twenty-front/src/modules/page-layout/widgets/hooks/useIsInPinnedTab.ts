import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { getTabsByDisplayMode } from '@/page-layout/utils/getTabsByDisplayMode';
import { getTabsWithVisibleWidgets } from '@/page-layout/utils/getTabsWithVisibleWidgets';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

export const useIsInPinnedTab = () => {
  const isMobile = useIsMobile();

  const { tabId } = usePageLayoutContentContext();
  const { isInRightDrawer } = useLayoutRenderingContext();
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const sortedTabs = sortTabsByPosition(currentPageLayout.tabs);

  const tabsWithVisibleWidgets = getTabsWithVisibleWidgets({
    tabs: sortedTabs,
    isMobile,
    isInRightDrawer,
    isEditMode: isPageLayoutInEditMode,
  });

  const { pinnedTab } = getTabsByDisplayMode({
    tabs: tabsWithVisibleWidgets,
    pageLayoutType: currentPageLayout.type,
  });

  return {
    isInPinnedTab: isDefined(pinnedTab) && pinnedTab.id === tabId,
  };
};
