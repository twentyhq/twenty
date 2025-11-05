import { type DraftPageLayout } from '@/page-layout/types/draft-page-layout';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { PageLayoutType } from '~/generated/graphql';

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
  if (
    isMobile ||
    isInRightDrawer ||
    pageLayout.type !== PageLayoutType.RECORD_PAGE
  ) {
    return {
      tabsToRenderInTabList: pageLayout.tabs,
      pinnedLeftTab: undefined,
    };
  }

  if (pageLayout.tabs.length === 1) {
    return {
      tabsToRenderInTabList: pageLayout.tabs,
      pinnedLeftTab: undefined,
    };
  }

  const tabsToRenderInTabList = pageLayout.tabs.slice(1);
  const pinnedLeftTab = pageLayout.tabs[0];

  return {
    tabsToRenderInTabList,
    pinnedLeftTab,
  };
};
