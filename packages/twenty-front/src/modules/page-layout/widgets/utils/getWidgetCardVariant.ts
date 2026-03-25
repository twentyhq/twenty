import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
} from '~/generated-metadata/graphql';
import { type WidgetCardVariant } from '~/modules/page-layout/widgets/types/WidgetCardVariant';

type GetWidgetCardVariantParams = {
  layoutMode: PageLayoutTabLayoutMode;
  isInPinnedTab: boolean;
  pageLayoutType: PageLayoutType | null;
  isMobile: boolean;
  isInSidePanel: boolean;
};

export const getWidgetCardVariant = ({
  layoutMode,
  isInPinnedTab,
  pageLayoutType,
  isMobile,
  isInSidePanel,
}: GetWidgetCardVariantParams): WidgetCardVariant => {
  if (pageLayoutType === PageLayoutType.DASHBOARD) {
    return 'dashboard';
  }

  if (layoutMode === PageLayoutTabLayoutMode.CANVAS) {
    return 'canvas';
  }

  if (isInPinnedTab || isMobile || isInSidePanel) {
    return 'side-column';
  }

  return 'record-page';
};
