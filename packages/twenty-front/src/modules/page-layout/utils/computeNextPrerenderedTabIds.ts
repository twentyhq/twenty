import { MAX_PRERENDERED_PAGE_LAYOUT_TABS } from '@/page-layout/constants/MaxPrerenderedPageLayoutTabs';

export const computeNextPrerenderedTabIds = ({
  currentTabIds,
  tabId,
}: {
  currentTabIds: string[];
  tabId: string;
}): string[] => {
  if (currentTabIds.at(-1) === tabId) {
    return currentTabIds;
  }

  return [...currentTabIds.filter((id) => id !== tabId), tabId].slice(
    -MAX_PRERENDERED_PAGE_LAYOUT_TABS,
  );
};
