import { type DraftPageLayout } from '@/page-layout/types/draft-page-layout';
import { type PageLayout } from '@/page-layout/types/PageLayout';

type GetTabsByDisplayModeParams = {
  pageLayout: PageLayout | DraftPageLayout;
  isMobile: boolean;
  isInRightDrawer: boolean;
};

export const getTabsByDisplayMode = ({
  pageLayout,
  isMobile,
  isInRightDrawer,
}: GetTabsByDisplayModeParams) => {
  if (isMobile || isInRightDrawer) {
    return {
      tabsToRenderInTabList: pageLayout.tabs,
      pinnedLeftTab: undefined,
    };
  }

  const tabsToRenderInTabList = pageLayout.tabs.filter(
    (tab) => tab.selfDisplayMode !== 'pinned-left',
  );
  const pinnedLeftTab = pageLayout.tabs.find(
    (tab) => tab.selfDisplayMode === 'pinned-left',
  );

  return {
    tabsToRenderInTabList,
    pinnedLeftTab,
  };
};
