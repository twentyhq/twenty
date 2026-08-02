import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { RECORD_GROUP_REORDER_CONFIRMATION_MODAL_ID } from '@/object-record/record-group/constants/RecordGroupReorderConfirmationModalId';
import { useReorderRecordGroups } from '@/object-record/record-group/hooks/useReorderRecordGroups';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { recordIndexKanbanColumnWidthComponentState } from '@/object-record/record-index/states/recordIndexKanbanColumnWidthComponentState';
import { recordIndexRecordGroupIsDraggableSortComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexRecordGroupIsDraggableSortComponentSelector';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';
import { resolveDropFromPointerX } from '@/ui/utilities/drag-and-drop/utils/resolveDropFromPointerX';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewType } from '@/views/types/ViewType';
import { type DragDropProviderDragEndEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragEndEvent';
import { type DragDropProviderDragMoveEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragMoveEvent';
import { type DragDropProviderDragStartEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragStartEvent';

type DragStartPayload = DragDropProviderDragStartEvent<DragDropItemData>;
type DragMovePayload = DragDropProviderDragMoveEvent<DragDropItemData>;
type DragEndPayload = DragDropProviderDragEndEvent<DragDropItemData>;

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

  const totalSize = visibleRecordGroupIds.length * recordIndexKanbanColumnWidth;

  const lastIndex = visibleRecordGroupIds.length;

  const handleDragStart = (_event: DragStartPayload) => {
    setActiveDropTargetIndex(null);
  };

  const handleDragMove = (event: DragMovePayload) => {
    const { target, position } = event.operation;

    const dropTargetIndex = resolveDropFromPointerX({
      target,
      pointerX: position.current.x,
      totalSize,
      lastIndex,
    });

    setActiveDropTargetIndex((currentActiveDropTargetIndex) =>
      currentActiveDropTargetIndex === dropTargetIndex
        ? currentActiveDropTargetIndex
        : dropTargetIndex,
    );
  };

  const handleDragEnd = (event: DragEndPayload) => {
    const { source, target, position } = event.operation;

    setActiveDropTargetIndex(null);
    setDragSelectionStartEnabled(true);

    if (event.canceled || !isDefined(source)) {
      return;
    }

    const sourceIndex = source.data.index;

    const dropTargetIndex = resolveDropFromPointerX({
      target,
      pointerX: position.current.x,
      totalSize,
      lastIndex,
    });
    if (!isDefined(dropTargetIndex)) return;

    const destinationIndex =
      dropTargetIndex > sourceIndex ? dropTargetIndex - 1 : dropTargetIndex;

    if (!isRecordGroupDraggableSort) {
      setPendingReorder({
        fromIndex: sourceIndex,
        toIndex: destinationIndex,
      });
      openModal(RECORD_GROUP_REORDER_CONFIRMATION_MODAL_ID);
      return;
    }

    reorderRecordGroups({
      fromIndex: sourceIndex,
      toIndex: destinationIndex,
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
