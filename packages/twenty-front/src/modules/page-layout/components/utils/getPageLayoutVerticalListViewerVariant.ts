import { type PageLayoutVerticalListViewerVariant } from '@/page-layout/types/PageLayoutVerticalListViewerVariant';

type GetPageLayoutVerticalListViewerVariantParams = {
  isInPinnedTab: boolean;
  isMobile: boolean;
  isInSidePanel: boolean;
};

export const getPageLayoutVerticalListViewerVariant = ({
  isInPinnedTab,
  isMobile,
  isInSidePanel,
}: GetPageLayoutVerticalListViewerVariantParams): PageLayoutVerticalListViewerVariant => {
  if (isInPinnedTab || isMobile || isInSidePanel) {
    return 'side-column';
  }

  return 'default';
};
