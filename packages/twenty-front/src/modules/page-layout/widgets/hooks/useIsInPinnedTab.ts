import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { getTabsByDisplayMode } from '@/page-layout/utils/getTabsByDisplayMode';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

export const useIsInPinnedTab = () => {
  const isMobile = useIsMobile();

  const { tabId } = usePageLayoutContentContext();
  const { isInRightDrawer } = useLayoutRenderingContext();
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  const { pinnedLeftTab } = getTabsByDisplayMode({
    pageLayout: currentPageLayout,
    isMobile,
    isInRightDrawer,
  });

  return {
    isInPinnedTab: isDefined(pinnedLeftTab) && pinnedLeftTab.id === tabId,
  };
};
