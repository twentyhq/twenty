import { type Draggable } from '@dnd-kit/dom';

import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';

export const getPageLayoutDragActivatorElements = (source: Draggable) => {
  const isOverflowTab =
    source.data.droppableId ===
    PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.OVERFLOW_TABS;

  return isOverflowTab ? [source.element] : [source.handle ?? source.element];
};
