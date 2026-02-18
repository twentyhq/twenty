import { type PageLayoutVerticalListViewerVariant } from '@/page-layout/types/PageLayoutVerticalListViewerVariant';

type GetPageLayoutVerticalListViewerVariantParams = {
  isInPinnedTab: boolean;
  isMobile: boolean;
  isInRightDrawer: boolean;
};

export const getPageLayoutVerticalListViewerVariant = ({
  isInPinnedTab,
  isMobile,
  isInRightDrawer,
}: GetPageLayoutVerticalListViewerVariantParams): PageLayoutVerticalListViewerVariant => {
  if (isInPinnedTab || isMobile || isInRightDrawer) {
    return 'side-column';
  }

  return 'default';
};
