import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { TAB_LIST_LEFT_PADDING } from '@/ui/layout/tab-list/constants/TabListPadding';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { type TabWidthsById } from '@/ui/layout/tab-list/types/TabWidthsById';
import { isDefined } from 'twenty-shared/utils';

type CalculateVisibleTabCountParams = {
  visibleTabs: SingleTabProps[];
  tabWidthsById: TabWidthsById;
  containerWidth: number;
  moreButtonWidth: number;
  addButtonWidth?: number;
};

export const calculateVisibleTabCount = ({
  visibleTabs,
  tabWidthsById,
  containerWidth,
  moreButtonWidth,
  addButtonWidth = 0,
}: CalculateVisibleTabCountParams): number => {
  if (Object.keys(tabWidthsById).length === 0 || containerWidth === 0) {
    return visibleTabs.length;
  }

  const availableWidth =
    containerWidth -
    TAB_LIST_LEFT_PADDING -
    (addButtonWidth > 0 ? addButtonWidth + TAB_LIST_GAP : 0);

  let totalWidth = 0;
  for (let i = 0; i < visibleTabs.length; i++) {
    const tab = visibleTabs[i];
    const tabWidth = tabWidthsById[tab.id];

    if (!isDefined(tabWidth)) {
      return visibleTabs.length;
    }

    const gapsWidth = i > 0 ? TAB_LIST_GAP : 0;
    const potentialMoreButtonWidth =
      i < visibleTabs.length - 1 ? moreButtonWidth + TAB_LIST_GAP : 0;

    totalWidth += tabWidth + gapsWidth;

    if (totalWidth + potentialMoreButtonWidth > availableWidth) {
      return Math.max(1, i);
    }
  }
  return visibleTabs.length;
};
