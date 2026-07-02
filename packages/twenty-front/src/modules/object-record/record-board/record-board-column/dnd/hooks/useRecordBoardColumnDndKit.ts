import { type DragDropProvider } from '@dnd-kit/react';
import { type ComponentProps, useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type RecordBoardColumnDndData } from '@/object-record/record-board/record-board-column/dnd/types/RecordBoardColumnDndData';
import { resolveRecordBoardColumnDrop } from '@/object-record/record-board/record-board-column/dnd/utils/resolveRecordBoardColumnDrop';
import { RECORD_GROUP_REORDER_CONFIRMATION_MODAL_ID } from '@/object-record/record-group/constants/RecordGroupReorderConfirmationModalId';
import { useReorderRecordGroups } from '@/object-record/record-group/hooks/useReorderRecordGroups';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { recordIndexKanbanColumnWidthComponentState } from '@/object-record/record-index/states/recordIndexKanbanColumnWidthComponentState';
import { recordIndexRecordGroupIsDraggableSortComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexRecordGroupIsDraggableSortComponentSelector';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewType } from '@/views/types/ViewType';

type DragStartPayload = Parameters<
  NonNullable<
    ComponentProps<
      typeof DragDropProvider<RecordBoardColumnDndData>
    >['onDragStart']
  >
>[0];
type DragMovePayload = Parameters<
  NonNullable<
    ComponentProps<
      typeof DragDropProvider<RecordBoardColumnDndData>
    >['onDragMove']
  >
>[0];
type DragEndPayload = Parameters<
  NonNullable<
    ComponentProps<
      typeof DragDropProvider<RecordBoardColumnDndData>
    >['onDragEnd']
  >
>[0];

type PendingReorder = {
  fromIndex: number;
  toIndex: number;
};

export type RecordBoardColumnDndKitContextValues = {
  activeDropTargetIndex: number | null;
};

export const useRecordBoardColumnDndKit = (): {
  contextValues: RecordBoardColumnDndKitContextValues;
  handlePendingReorderConfirmClick: () => void;
  handlers: {
    onDragStart: (event: DragStartPayload) => void;
    onDragMove: (event: DragMovePayload) => void;
    onDragEnd: (event: DragEndPayload) => void;
  };
} => {
  const { openModal } = useModal();
  const { recordIndexId } = useRecordIndexIdFromCurrentContextStore();
  const { reorderRecordGroups } = useReorderRecordGroups({
    recordIndexId,
    viewType: ViewType.KANBAN,
  });
  const { setDragSelectionStartEnabled } = useDragSelect();
  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  const isRecordGroupDraggableSort = useAtomComponentSelectorValue(
    recordIndexRecordGroupIsDraggableSortComponentSelector,
    recordIndexId,
  );

  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.KANBAN,
  );
  const recordIndexKanbanColumnWidth = useAtomComponentStateValue(
    recordIndexKanbanColumnWidthComponentState,
  );

  const [, setRecordIndexRecordGroupSort] = useAtomComponentState(
    recordIndexRecordGroupSortComponentState,
  );

  const [activeDropTargetIndex, setActiveDropTargetIndex] = useState<
    number | null
  >(null);

  const [pendingReorder, setPendingReorder] = useState<PendingReorder | null>(
    null,
  );

  const resolveDropFromPointerX = useCallback(
    ({ pointerX, sourceIndex }: { pointerX: number; sourceIndex: number }) => {
      const { scrollWrapperElement } = getScrollWrapperElement();
      if (!isDefined(scrollWrapperElement)) return null;

      const columnWidths = visibleRecordGroupIds.map(
        () => recordIndexKanbanColumnWidth,
      );

      if (columnWidths.length === 0) {
        return null;
      }

      return resolveRecordBoardColumnDrop({
        pointerX,
        sourceIndex,
        scrollWrapperElement,
        columnWidths,
      });
    },
    [
      getScrollWrapperElement,
      recordIndexKanbanColumnWidth,
      visibleRecordGroupIds,
    ],
  );

  const handleDragStart = (_event: DragStartPayload) => {
    setActiveDropTargetIndex(null);
  };

  const handleDragMove = useCallback(
    (event: DragMovePayload) => {
      const { operation } = event;
      const sourceIndex = operation.source?.data.index;

      if (!isDefined(sourceIndex)) {
        setActiveDropTargetIndex(null);
        return;
      }

      const resolvedDrop = resolveDropFromPointerX({
        pointerX: operation.position.current.x,
        sourceIndex,
      });

      setActiveDropTargetIndex((currentActiveDropTargetIndex) => {
        const nextActiveDropTargetIndex = resolvedDrop?.dropTargetIndex ?? null;

        return currentActiveDropTargetIndex === nextActiveDropTargetIndex
          ? currentActiveDropTargetIndex
          : nextActiveDropTargetIndex;
      });
    },
    [resolveDropFromPointerX, setActiveDropTargetIndex],
  );

  const handleDragEnd = (event: DragEndPayload) => {
    const { operation } = event;
    const source = operation.source;

    setActiveDropTargetIndex(null);
    setDragSelectionStartEnabled(true);

    if (event.canceled || !isDefined(source)) {
      return;
    }

    const sourceIndex = source.data.index;
    const resolvedDrop = resolveDropFromPointerX({
      pointerX: operation.position.current.x,
      sourceIndex,
    });

    if (!isDefined(resolvedDrop)) return;
    if (resolvedDrop.sourceIndex === resolvedDrop.destinationIndex) return;

    if (!isRecordGroupDraggableSort) {
      setPendingReorder({
        fromIndex: resolvedDrop.sourceIndex,
        toIndex: resolvedDrop.destinationIndex,
      });
      openModal(RECORD_GROUP_REORDER_CONFIRMATION_MODAL_ID);
      return;
    }

    reorderRecordGroups({
      fromIndex: resolvedDrop.sourceIndex,
      toIndex: resolvedDrop.destinationIndex,
    });
  };

  const handlePendingReorderConfirmClick = () => {
    if (!isDefined(pendingReorder)) return;

    setRecordIndexRecordGroupSort(RecordGroupSort.Manual);
    reorderRecordGroups(pendingReorder);
    setPendingReorder(null);
  };

  return {
    contextValues: {
      activeDropTargetIndex,
    },
    handlePendingReorderConfirmClick,
    handlers: {
      onDragStart: handleDragStart,
      onDragMove: handleDragMove,
      onDragEnd: handleDragEnd,
    },
  };
};
