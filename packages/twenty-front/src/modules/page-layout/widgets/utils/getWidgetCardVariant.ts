import { type PageLayoutTabLayoutMode } from '@/page-layout/types/PageLayoutTabLayoutMode';
import { PageLayoutType } from '~/generated/graphql';
import { type WidgetCardVariant } from '~/modules/page-layout/widgets/types/WidgetCardVariant';

type GetWidgetCardVariantParams = {
  layoutMode: PageLayoutTabLayoutMode;
  isInPinnedTab: boolean;
  pageLayoutType: PageLayoutType | null;
};

export const getWidgetCardVariant = ({
  layoutMode,
  isInPinnedTab,
  pageLayoutType,
}: GetWidgetCardVariantParams): WidgetCardVariant => {
  if (pageLayoutType === PageLayoutType.DASHBOARD) {
    return 'dashboard';
  }

  if (layoutMode === 'canvas') {
    return 'canvas';
  }

  if (isInPinnedTab) {
    return 'side-column';
  }

  return 'record-page';
};
