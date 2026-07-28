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
  // A column surface owns its gutter whatever the tab presentation is: solo is
  // a main-tab-area concept, so it must not strip the chrome off a widget
  // rendered in the pinned panel, the side panel or on mobile.
  const isSideColumnContext = isInPinnedTab || isMobile || isInSidePanel;

  if (isSideColumnContext) {
    return 'side-column';
  }

  if (presentation === 'solo') {
    return 'solo';
  }

  switch (pageLayoutType) {
    case PageLayoutType.DASHBOARD:
      return 'dashboard';
    case PageLayoutType.STANDALONE_PAGE:
      return 'standalone';
    case PageLayoutType.RECORD_PAGE:
    case PageLayoutType.RECORD_INDEX:
    case null:
      return 'record-page';
  }
};
