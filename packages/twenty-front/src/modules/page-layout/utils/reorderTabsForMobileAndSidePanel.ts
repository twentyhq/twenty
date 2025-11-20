import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';

type ReorderTabsForMobileAndSidePanelParams = {
  tabs: PageLayoutTab[];
  isMobile: boolean;
  isInRightDrawer: boolean;
};

export const reorderTabsForMobileAndSidePanel = ({
  tabs,
  isMobile,
  isInRightDrawer,
}: ReorderTabsForMobileAndSidePanelParams): PageLayoutTab[] => {
  if (!(isMobile || isInRightDrawer)) {
    return tabs;
  }

  if (
    tabs.length >= 2 &&
    tabs[1].displayAsFirstTabOnMobileAndSidePanel === true
  ) {
    return [tabs[1], tabs[0], ...tabs.slice(2)];
  }

  return tabs;
};
