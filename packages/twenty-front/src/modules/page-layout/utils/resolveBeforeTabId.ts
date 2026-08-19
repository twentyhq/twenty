import { isDefined } from 'twenty-shared/utils';

import { type PageLayoutWidgetDndData } from '@/page-layout/types/PageLayoutWidgetDndData';
import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';
import { type DragDropProviderDragEndEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragEndEvent';
import { resolveDropFromPointer } from '@/ui/utilities/drag-and-drop/utils/resolveDropFromPointer';

type DragEndEvent = DragDropProviderDragEndEvent<PageLayoutWidgetDndData>;

export const resolveBeforeTabId = (
  event: DragEndEvent,
  targetData: PageLayoutWidgetDndData,
): string | null | undefined => {
  if (targetData.type === 'tab-more-button') {
    return null;
  }

  if (targetData.type !== 'tab') {
    return undefined;
  }

  const resolvedDrop = resolveDropFromPointer({
    target: event.operation.target,
    pointer: event.operation.position.current,
    getDroppableItemCount: () => 0,
  });
  const targetSortableData = event.operation.target?.data as
    | DragDropItemData
    | undefined;

  if (!isDefined(resolvedDrop) || !isDefined(targetSortableData)) {
    return targetData.tabId;
  }

  return resolvedDrop.dropTargetIndex > targetSortableData.index
    ? (targetData.nextTabId ?? null)
    : targetData.tabId;
};
