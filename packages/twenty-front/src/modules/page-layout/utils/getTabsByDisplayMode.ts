import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { reorderTabsForMobileAndSidePanel } from '@/page-layout/utils/reorderTabsForMobileAndSidePanel';
import { PageLayoutType } from '~/generated/graphql';

type GetTabsByDisplayModeParams = {
  tabs: PageLayoutTab[];
  pageLayoutType: PageLayoutType;
  displaySecondTabAsFirstTabOnMobileAndSidePanel?: boolean;
  isMobile: boolean;
  isInRightDrawer: boolean;
};

export const getTabsByDisplayMode = ({
  tabs,
  pageLayoutType,
  isMobile,
  isInRightDrawer,
  displaySecondTabAsFirstTabOnMobileAndSidePanel,
}: GetTabsByDisplayModeParams) => {
  const reorderedTabs = reorderTabsForMobileAndSidePanel({
    tabs,
    displaySecondTabAsFirstTabOnMobileAndSidePanel,
    isMobile,
    isInRightDrawer,
  });

  if (
    isMobile ||
    isInRightDrawer ||
    pageLayoutType !== PageLayoutType.RECORD_PAGE
  ) {
    return {
      tabsToRenderInTabList: reorderedTabs,
      pinnedLeftTab: undefined,
    };
  }

  if (reorderedTabs.length === 1) {
    return {
      tabsToRenderInTabList: reorderedTabs,
      pinnedLeftTab: undefined,
    };
  }

  const tabsToRenderInTabList = reorderedTabs.slice(1);
  const pinnedLeftTab = reorderedTabs[0];

  return {
    tabsToRenderInTabList,
    pinnedLeftTab,
  };
};
