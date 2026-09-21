import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { TAB_LIST_HORIZONTAL_PADDING } from '@/ui/layout/tab-list/constants/TabListPadding';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { type TabWidthsById } from '@/ui/layout/tab-list/types/TabWidthsById';
import { isDefined } from 'twenty-shared/utils';

type CalculateVisibleTabCountParams = {
  visibleTabs: SingleTabProps[];
  tabWidthsById: TabWidthsById;
  containerWidth: number;
  moreButtonWidth: number;
  addButtonWidth?: number;
  rightPadding?: number;
};

export const calculateVisibleTabCount = ({
  visibleTabs,
  tabWidthsById,
  containerWidth,
  moreButtonWidth,
  addButtonWidth = 0,
  rightPadding = 0,
}: CalculateVisibleTabCountParams): number => {
  const measuredTabWidths = visibleTabs
    .map((tab) => tabWidthsById[tab.id])
    .filter(isDefined);

  if (measuredTabWidths.length === 0 || containerWidth === 0) {
    return visibleTabs.length;
  }

  // A tab added in this render is measured one commit later; standing in the
  // widest known tab keeps the row from overflowing until its width arrives.
  const unmeasuredTabWidth = Math.max(...measuredTabWidths);

  const availableWidth =
    containerWidth -
    TAB_LIST_HORIZONTAL_PADDING -
    rightPadding -
    (addButtonWidth > 0 ? addButtonWidth + TAB_LIST_GAP : 0);

  let totalWidth = 0;

  for (let i = 0; i < visibleTabs.length; i++) {
    const tabWidth = tabWidthsById[visibleTabs[i].id] ?? unmeasuredTabWidth;

    totalWidth += i > 0 ? TAB_LIST_GAP + tabWidth : tabWidth;

    const overflowButtonWidth =
      i < visibleTabs.length - 1 ? TAB_LIST_GAP + moreButtonWidth : 0;

    if (totalWidth + overflowButtonWidth > availableWidth) {
      // Keeping a tab that does not fit next to the overflow button would clip
      // it against the row and leave it out of the menu, so it goes to overflow
      // together with everything after it, even when nothing is left on the row.
      return i;
    }
  }

  return visibleTabs.length;
};
