import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { filterTabsWithVisibleWidgets } from '@/page-layout/utils/filterTabsWithVisibleWidgets';
import { getTabsByDisplayMode } from '@/page-layout/utils/getTabsByDisplayMode';
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

  const filteredTabs = filterTabsWithVisibleWidgets({
    tabs: currentPageLayout.tabs,
    isMobile,
    isInRightDrawer,
    isEditMode: isPageLayoutInEditMode,
  });

  const { pinnedLeftTab } = getTabsByDisplayMode({
    tabs: filteredTabs,
    pageLayoutType: currentPageLayout.type,
    isMobile,
    isInRightDrawer,
  });

  return {
    isInPinnedTab: isDefined(pinnedLeftTab) && pinnedLeftTab.id === tabId,
  };
};
