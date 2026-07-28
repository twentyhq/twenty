import { type TabPresentation } from '@/page-layout/types/TabPresentation';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { type WidgetCardVariant } from '~/modules/page-layout/widgets/types/WidgetCardVariant';

type GetWidgetCardVariantParams = {
  presentation: TabPresentation;
  isInPinnedTab: boolean;
  pageLayoutType: PageLayoutType | null;
  isMobile: boolean;
  isInSidePanel: boolean;
};

export const getWidgetCardVariant = ({
  presentation,
  isInPinnedTab,
  pageLayoutType,
  isMobile,
  isInSidePanel,
}: GetWidgetCardVariantParams): WidgetCardVariant => {
  if (presentation === 'solo') {
    return 'solo';
  }

  const isSideColumnContext = isInPinnedTab || isMobile || isInSidePanel;

  switch (pageLayoutType) {
    case PageLayoutType.DASHBOARD:
      return 'dashboard';
    case PageLayoutType.STANDALONE_PAGE:
      return 'standalone';
    case PageLayoutType.RECORD_PAGE:
    case PageLayoutType.RECORD_INDEX:
    case null:
      return isSideColumnContext ? 'side-column' : 'record-page';
  }
};
