import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { PageLayoutType } from '~/generated/graphql';

type GetTabsByDisplayModeParams = {
  tabs: PageLayoutTab[];
  pageLayoutType: PageLayoutType;
};

export const getTabsByDisplayMode = ({
  tabs,
  pageLayoutType,
}: GetTabsByDisplayModeParams) => {
  if (pageLayoutType !== PageLayoutType.RECORD_PAGE) {
    return {
      pinnedTab: undefined,
      otherTabs: tabs,
    };
  }

  if (tabs.length === 1) {
    return {
      pinnedTab: undefined,
      otherTabs: tabs,
    };
  }

  const pinnedTab = tabs[0];
  const otherTabs = tabs.slice(1);

  return {
    pinnedTab,
    otherTabs,
  };
};
