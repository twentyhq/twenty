import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { isDefined } from 'twenty-shared/utils';

type GetPageLayoutTabListInitialActiveTabIdParams = {
  activeTabId: string | null;
  tabs: PageLayoutTab[];
  defaultTabToFocusOnMobileAndSidePanelId?: string;
  isMobile: boolean;
  isInRightDrawer: boolean;
};

export const getPageLayoutTabListInitialActiveTabId = ({
  activeTabId,
  tabs,
  defaultTabToFocusOnMobileAndSidePanelId,
  isMobile,
  isInRightDrawer,
}: GetPageLayoutTabListInitialActiveTabIdParams): string | null => {
  const activeTabExists = tabs.some((tab) => tab.id === activeTabId);

  if (activeTabExists) {
    return activeTabId;
  }

  const isOnMobileOrSidePanel = isMobile || isInRightDrawer;

  if (
    isOnMobileOrSidePanel &&
    isDefined(defaultTabToFocusOnMobileAndSidePanelId)
  ) {
    const defaultTabExists = tabs.some(
      (tab) => tab.id === defaultTabToFocusOnMobileAndSidePanelId,
    );

    if (defaultTabExists) {
      return defaultTabToFocusOnMobileAndSidePanelId;
    }
  }

  return tabs[0]?.id ?? null;
};
