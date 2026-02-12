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
  isInRightDrawer: boolean;
};

export const getWidgetCardVariant = ({
  layoutMode,
  isInPinnedTab,
  pageLayoutType,
  isMobile,
  isInRightDrawer,
}: GetWidgetCardVariantParams): WidgetCardVariant => {
  if (pageLayoutType === PageLayoutType.DASHBOARD) {
    return 'dashboard';
  }

  if (layoutMode === PageLayoutTabLayoutMode.CANVAS) {
    return 'canvas';
  }

  if (isInPinnedTab || isMobile || isInRightDrawer) {
    return 'side-column';
  }

  return 'record-page';
};
