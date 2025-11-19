import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { PageLayoutType } from '~/generated/graphql';

type GetTabsByDisplayModeParams = {
  tabs: PageLayoutTab[];
  pageLayoutType: PageLayoutType;
  isMobile: boolean;
  isInRightDrawer: boolean;
};

export const getTabsByDisplayMode = ({
  tabs,
  pageLayoutType,
  isMobile,
  isInRightDrawer,
}: GetTabsByDisplayModeParams) => {
  if (
    isMobile ||
    isInRightDrawer ||
    pageLayoutType !== PageLayoutType.RECORD_PAGE
  ) {
    return {
      tabsToRenderInTabList: tabs,
      pinnedLeftTab: undefined,
    };
  }

  if (tabs.length === 1) {
    return {
      tabsToRenderInTabList: tabs,
      pinnedLeftTab: undefined,
    };
  }

  const tabsToRenderInTabList = tabs.slice(1);
  const pinnedLeftTab = tabs[0];

  return {
    tabsToRenderInTabList,
    pinnedLeftTab,
  };
};
