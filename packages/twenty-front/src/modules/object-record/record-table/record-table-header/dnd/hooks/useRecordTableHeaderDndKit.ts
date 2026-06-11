import { type DragDropProvider } from '@dnd-kit/react';
import { useStore } from 'jotai';
import { type ComponentProps, useCallback, useState } from 'react';
import { filterOutByProperty, isDefined } from 'twenty-shared/utils';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import type { DraggableData } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitDraggableData';
import type { DropDestination } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitDropDestination';
import type { NavigationMenuItemDropResult } from '@/navigation-menu-item/common/types/navigationMenuItemDropResult';
import { resolveRecordTableHeaderDropTarget } from '@/object-record/record-table/record-table-header/dnd/utils/recordTableHeaderDndKitResolveDropTarget';
import { useReorderColumns } from '@/object-record/record-table/record-table-header/hooks/useReorderColumns';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { isRecordTableHeaderDropProcessingComponentState } from '@/object-record/record-table/record-table-header/states/isRecordTableHeaderDropProcessingComponentState';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';

type DragStartPayload = Parameters<
  NonNullable<
    ComponentProps<typeof DragDropProvider<DraggableData>>['onDragStart']
  >
>[0];
type DragMovePayload = Parameters<
  NonNullable<
    ComponentProps<typeof DragDropProvider<DraggableData>>['onDragMove']
  >
>[0];
type DragEndPayload = Parameters<
  NonNullable<
    ComponentProps<typeof DragDropProvider<DraggableData>>['onDragEnd']
  >
>[0];

export type RecordTableHeaderDndKitContextValues = {
  isDragging: boolean;
  activeDropTargetIndex: number | null;
  activeDraggedFieldMetadataItemId: string | null;
};

export const useRecordTableHeaderDndKit = (): {
  contextValues: RecordTableHeaderDndKitContextValues;
  handlers: {
    onDragStart: (event: DragStartPayload) => void;
    onDragMove: (event: DragMovePayload) => void;
    onDragEnd: (event: DragEndPayload) => void;
  };
} => {
  const store = useStore();

  const { visibleRecordFields } = useRecordTableContextOrThrow();
  const { labelIdentifierFieldMetadataItem } = useRecordIndexContextOrThrow();
  const { reorderColumns } = useReorderColumns();
  const { setDragSelectionStartEnabled } = useDragSelect();
  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  const [isDragging, setIsDragging] = useState(false);
  const [sourceDroppableId, setSourceDroppableId] = useState<string | null>(
    null,
  );
  const [activeDropTargetIndex, setActiveDropTargetIndex] = useState<
    number | null
  >(null);
  // const [
  //   addToNavigationFallbackDestination,
  //   setAddToNavigationFallbackDestination,
  // ] = useState<DropDestination | null>(null);

  const isRecordTableHeaderDropProcessingCallbackState =
    useAtomComponentStateCallbackState(
      isRecordTableHeaderDropProcessingComponentState,
    );

  const recordFieldsWithoutLabelIdentifier = visibleRecordFields.filter(
    filterOutByProperty(
      'fieldMetadataItemId',
      labelIdentifierFieldMetadataItem?.id,
    ),
  );

  const getDropTargetIndexFromPointerX = (pointerX: number) => {
    const scrollContainer = getScrollWrapperElement();
    if (!isDefined(scrollContainer.scrollWrapperElement)) return;

    const scrollContainerRect =
      scrollContainer.scrollWrapperElement.getBoundingClientRect();

    const contentX =
      pointerX -
      scrollContainerRect.left +
      scrollContainer.scrollWrapperElement.scrollLeft;

    let left = 0;

    for (const [index, field] of recordFieldsWithoutLabelIdentifier.entries()) {
      const width = field.size;
      const midpoint = left + width / 2;

      if (contentX < midpoint) {
        return index;
      }

      left += width;
    }

    return recordFieldsWithoutLabelIdentifier.length;
  };

  const handleDragStart = (event: DragStartPayload) => {
    const { operation } = event;
    const source = operation.source;
    const sourceId = source?.data?.sourceDroppableId ?? null;

    setIsDragging(true);
    setSourceDroppableId(sourceId);

    store.set(isRecordTableHeaderDropProcessingCallbackState, true);

    setActiveDropTargetIndex(0);
  };

  const handleDragMove = useCallback(
    (event: DragMovePayload) => {
      const { operation } = event;
      const dropTargetIndex = getDropTargetIndexFromPointerX(
        operation.position.current.x,
      );

      setActiveDropTargetIndex(dropTargetIndex);

      // setDraggableInitialPosition(operation.position.initial);
    },
    [getDropTargetIndexFromPointerX, setActiveDropTargetIndex],
  );

  const handleDragEnd = (event: DragEndPayload) => {
    const { operation } = event;
    const source = operation.source;
    const target = operation.target;

    setIsDragging(false);
    setSourceDroppableId(null);
    setActiveDropTargetIndex(null);

    store.set(isRecordTableHeaderDropProcessingCallbackState, false);
    setDragSelectionStartEnabled(true);

    if (!isDefined(source) || !isDefined(activeDropTargetIndex)) return;

    const sourceIndex = source.data.index;
    const destinationIndex =
      activeDropTargetIndex > sourceIndex
        ? activeDropTargetIndex - 1
        : activeDropTargetIndex;

    reorderColumns({ sourceIndex, destinationIndex });
  };

  const contextValues: RecordTableHeaderDndKitContextValues = {
    isDragging,
    activeDropTargetIndex,
    activeDraggedFieldMetadataItemId: '',
  };

  return {
    contextValues,
    handlers: {
      onDragStart: handleDragStart,
      onDragMove: handleDragMove,
      onDragEnd: handleDragEnd,
    },
  };
};
