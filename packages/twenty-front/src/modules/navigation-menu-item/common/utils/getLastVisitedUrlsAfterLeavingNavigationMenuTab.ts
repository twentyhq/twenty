import { getNavigationMenuTabFolderKey } from '@/navigation-menu-item/common/utils/getNavigationMenuTabFolderKey';

export const getLastVisitedUrlsAfterLeavingNavigationMenuTab = ({
  lastVisitedUrls,
  leftTabId,
  tabIdHoldingCurrentPage,
  currentUrl,
}: {
  lastVisitedUrls: Record<string, string>;
  leftTabId: string | null;
  tabIdHoldingCurrentPage: string | null;
  currentUrl: string;
}): Record<string, string> => {
  if (leftTabId !== tabIdHoldingCurrentPage) {
    return lastVisitedUrls;
  }

  return {
    ...lastVisitedUrls,
    [getNavigationMenuTabFolderKey(leftTabId)]: currentUrl,
  };
};
