import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { PageLayoutType } from '~/generated-metadata/graphql';

type GetTabsByDisplayModeParams = {
  tabs: PageLayoutTab[];
  pageLayoutType: PageLayoutType;
  isMobile: boolean;
  isInSidePanel: boolean;
};

export const getTabsByDisplayMode = ({
  tabs,
  pageLayoutType,
  isMobile,
  isInSidePanel,
}: GetTabsByDisplayModeParams) => {
  if (
    isMobile ||
    isInSidePanel ||
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

  const sortedTabs = sortTabsByPosition(tabs);

  const tabsToRenderInTabList = sortedTabs.slice(1);
  const pinnedLeftTab = sortedTabs[0];

  return {
    tabsToRenderInTabList,
    pinnedLeftTab,
  };
};
