import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { isDefined } from 'twenty-shared/utils';

type GetPageLayoutTabListInitialActiveTabIdParams = {
  activeTabId: string | null;
  tabs: PageLayoutTab[];
  defaultTabIdToFocusOnMobileAndSidePanel?: string;
  isMobile: boolean;
  isInRightDrawer: boolean;
};

export const getPageLayoutTabListInitialActiveTabId = ({
  activeTabId,
  tabs,
  defaultTabIdToFocusOnMobileAndSidePanel,
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
    isDefined(defaultTabIdToFocusOnMobileAndSidePanel)
  ) {
    const defaultTabExists = tabs.some(
      (tab) => tab.id === defaultTabIdToFocusOnMobileAndSidePanel,
    );

    if (defaultTabExists) {
      return defaultTabIdToFocusOnMobileAndSidePanel;
    }
  }

  return tabs[0]?.id ?? null;
};
