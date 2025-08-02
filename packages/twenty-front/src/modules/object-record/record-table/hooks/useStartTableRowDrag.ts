import { DragStart } from '@hello-pangea/dnd';
import { useRecoilCallback } from 'recoil';

import { getDragOperationType } from '@/object-record/record-board/utils/getDragOperationType';
import { draggedRecordIdsTableComponentState } from '@/object-record/record-table/states/draggedRecordIdsTableComponentState';
import { isMultiDragActiveTableComponentState } from '@/object-record/record-table/states/isMultiDragActiveTableComponentState';
import { originalSelectionTableComponentState } from '@/object-record/record-table/states/originalSelectionTableComponentState';
import { primaryDraggedRecordIdTableComponentState } from '@/object-record/record-table/states/primaryDraggedRecordIdTableComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';

export const useStartTableRowDrag = (recordTableId?: string) => {
  const isMultiDragActiveState = useRecoilComponentCallbackStateV2(
    isMultiDragActiveTableComponentState,
    recordTableId,
  );

  const draggedRecordIdsState = useRecoilComponentCallbackStateV2(
    draggedRecordIdsTableComponentState,
    recordTableId,
  );

  const primaryDraggedRecordIdState = useRecoilComponentCallbackStateV2(
    primaryDraggedRecordIdTableComponentState,
    recordTableId,
  );

  const originalSelectionState = useRecoilComponentCallbackStateV2(
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
