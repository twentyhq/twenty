import { DragStart } from '@hello-pangea/dnd';
import { useRecoilCallback } from 'recoil';

import { getDragOperationType } from '@/object-record/record-board/utils/getDragOperationType';
import { draggedRecordIdsTableComponentState } from '@/object-record/record-table/states/draggedRecordIdsTableComponentState';
import { isMultiDragActiveTableComponentState } from '@/object-record/record-table/states/isMultiDragActiveTableComponentState';
import { originalSelectionTableComponentState } from '@/object-record/record-table/states/originalSelectionTableComponentState';
import { primaryDraggedRecordIdTableComponentState } from '@/object-record/record-table/states/primaryDraggedRecordIdTableComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';

export const useStartTableRowDrag = (recordTableId?: string) => {
  const isMultiDragActiveState = useRecoilComponentCallbackState(
    isMultiDragActiveTableComponentState,
    recordTableId,
  );

  const draggedRecordIdsState = useRecoilComponentCallbackState(
    draggedRecordIdsTableComponentState,
    recordTableId,
  );

  const primaryDraggedRecordIdState = useRecoilComponentCallbackState(
    primaryDraggedRecordIdTableComponentState,
    recordTableId,
  );

  const originalSelectionState = useRecoilComponentCallbackState(
    originalSelectionTableComponentState,
    recordTableId,
  );

  return useRecoilCallback(
    ({ set }) =>
      (start: DragStart, selectedRecordIds: string[]) => {
        const draggedRecordId = start.draggableId;

        const operationType = getDragOperationType({
          draggedRecordId,
          selectedRecordIds,
        });

        if (operationType === 'multi') {
          set(isMultiDragActiveState, true);
          set(draggedRecordIdsState, selectedRecordIds);
          set(primaryDraggedRecordIdState, draggedRecordId);
          set(originalSelectionState, selectedRecordIds);
        } else {
          set(isMultiDragActiveState, true);
          set(draggedRecordIdsState, [draggedRecordId]);
          set(primaryDraggedRecordIdState, draggedRecordId);
          set(originalSelectionState, [draggedRecordId]);
        }
      },
    [
      isMultiDragActiveState,
      draggedRecordIdsState,
      primaryDraggedRecordIdState,
      originalSelectionState,
    ],
  );
};
