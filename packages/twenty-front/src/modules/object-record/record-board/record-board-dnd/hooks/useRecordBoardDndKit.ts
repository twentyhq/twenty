import { type DragDropProvider } from '@dnd-kit/react';
import { useStore } from 'jotai';
import { type ComponentProps, useContext, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';
import { isRecordBoardDropProcessingComponentState } from '@/object-record/record-board/states/isRecordBoardDropProcessingComponentState';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { getBoardCardDropBehavior } from '@/object-record/record-board/utils/getBoardCardDropBehavior';
import { getDestinationIndex } from '@/ui/utilities/drag-and-drop/utils/getDestinationIndex';
import { resolveDropFromPointerY } from '@/ui/utilities/drag-and-drop/utils/resolveDropFromPointerY';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useEndRecordDrag } from '@/object-record/record-drag/hooks/useEndRecordDrag';
import { useProcessBoardCardDrop } from '@/object-record/record-drag/hooks/useProcessBoardCardDrop';
import { useStartRecordDrag } from '@/object-record/record-drag/hooks/useStartRecordDrag';
import { originalDragSelectionComponentState } from '@/object-record/record-drag/states/originalDragSelectionComponentState';
import { RECORD_INDEX_REMOVE_SORTING_MODAL_ID } from '@/object-record/record-index/constants/RecordIndexRemoveSortingModalId';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

type DragStartPayload = Parameters<
  NonNullable<
    ComponentProps<typeof DragDropProvider<DragDropItemData>>['onDragStart']
  >
>[0];
type DragMovePayload = Parameters<
  NonNullable<
    ComponentProps<typeof DragDropProvider<DragDropItemData>>['onDragMove']
  >
>[0];
type DragEndPayload = Parameters<
  NonNullable<
    ComponentProps<typeof DragDropProvider<DragDropItemData>>['onDragEnd']
  >
>[0];

export type RecordBoardDndKitContextValues = {
  activeDropTargetIndex: number | null;
  activeDroppableId: string | null;
};

export const useRecordBoardDndKit = (): {
  contextValues: RecordBoardDndKitContextValues;
  handlers: {
    onDragStart: (event: DragStartPayload) => void;
    onDragMove: (event: DragMovePayload) => void;
    onDragEnd: (event: DragEndPayload) => void;
  };
} => {
  const store = useStore();

  const { recordBoardId } = useContext(RecordBoardContext);

  const currentRecordSorts = useAtomComponentStateCallbackState(
    currentRecordSortsComponentState,
    recordBoardId,
  );

  const recordBoardSelectedRecordIds = useAtomComponentSelectorCallbackState(
    recordBoardSelectedRecordIdsComponentSelector,
    recordBoardId,
  );

  const originalDragSelectionCallbackState = useAtomComponentStateCallbackState(
    originalDragSelectionComponentState,
  );

  const recordIdsByGroupCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
      recordBoardId,
    );

  const { startRecordDrag } = useStartRecordDrag();
  const { endRecordDrag } = useEndRecordDrag();

  const { processBoardCardDrop } = useProcessBoardCardDrop();

  const isRecordBoardDropProcessingCallbackState =
    useAtomComponentStateCallbackState(
      isRecordBoardDropProcessingComponentState,
    );

  const { openModal } = useModal();

  const [activeDropTargetIndex, setActiveDropTargetIndex] = useState<
    number | null
  >(null);

  const [activeDroppableId, setActiveDroppableId] = useState<string | null>(
    null,
  );

  const getDroppableItemCount = (droppableId: string) =>
    store.get(recordIdsByGroupCallbackState(droppableId)).length;

  const clearDragState = () => {
    endRecordDrag();
    setActiveDropTargetIndex(null);
    setActiveDroppableId(null);
  };

  const resetDragState = () => {
    store.set(isRecordBoardDropProcessingCallbackState, false);
    clearDragState();
  };

  const handleDragStart = (event: DragStartPayload) => {
    const draggedRecordId = event.operation.source?.id;

    if (!isDefined(draggedRecordId)) {
      return;
    }

    const currentSelectedRecordIds = store.get(recordBoardSelectedRecordIds);

    startRecordDrag(String(draggedRecordId), currentSelectedRecordIds);
  };

  const handleDragMove = (event: DragMovePayload) => {
    const { target, position } = event.operation;

    const resolvedDrop = resolveDropFromPointerY({
      target,
      pointerY: position.current.y,
      getDroppableItemCount,
    });

    if (!isDefined(resolvedDrop)) {
      setActiveDropTargetIndex(null);
      setActiveDroppableId(null);
      return;
    }

    setActiveDropTargetIndex(resolvedDrop.dropTargetIndex);
    setActiveDroppableId(resolvedDrop.droppableId);
  };

  const handleDragEnd = (event: DragEndPayload) => {
    const { source, target, position } = event.operation;

    if (event.canceled || !isDefined(source)) {
      resetDragState();
      return;
    }

    const sourceId = source.id;
    const sourceDroppableId = (source.data as DragDropItemData).droppableId;
    const sourceIndex = (source.data as DragDropItemData).index;

    const resolvedDrop = resolveDropFromPointerY({
      target,
      pointerY: position.current.y,
      getDroppableItemCount,
    });
    if (!isDefined(resolvedDrop)) {
      resetDragState();
      return;
    }

    const destinationDroppableId = resolvedDrop.droppableId;

    const existingRecordSorts = store.get(currentRecordSorts);
    const boardCardDropBehavior = getBoardCardDropBehavior({
      hasRecordSorts: existingRecordSorts.length > 0,
      sourceDroppableId,
      destinationDroppableId,
    });

    if (boardCardDropBehavior.shouldBlockDrop) {
      resetDragState();
      openModal(RECORD_INDEX_REMOVE_SORTING_MODAL_ID);
      return;
    }

    const destinationIndex = getDestinationIndex({
      dropTargetIndex: resolvedDrop.dropTargetIndex,
      sourceIndex,
      sourceDroppableId,
      destinationDroppableId,
    });

    const isSameColumn = sourceDroppableId === destinationDroppableId;

    if (isSameColumn && destinationIndex === sourceIndex) {
      resetDragState();
      return;
    }

    const originalDragSelection = store.get(originalDragSelectionCallbackState);

    store.set(isRecordBoardDropProcessingCallbackState, true);

    try {
      processBoardCardDrop(
        destinationDroppableId,
        sourceId as string,
        destinationIndex,
        originalDragSelection,
        {
          shouldUpdatePosition: boardCardDropBehavior.shouldUpdatePosition,
        },
      );
    } catch (error) {
      resetDragState();
      throw error;
    }

    clearDragState();
  };

  const contextValues: RecordBoardDndKitContextValues = {
    activeDropTargetIndex,
    activeDroppableId,
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
