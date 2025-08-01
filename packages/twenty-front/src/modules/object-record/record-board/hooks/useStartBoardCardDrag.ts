import { DragStart } from '@hello-pangea/dnd';
import { useRecoilCallback } from 'recoil';

import { draggedRecordIdsComponentState } from '@/object-record/record-board/states/draggedRecordIdsComponentState';
import { isMultiDragActiveComponentState } from '@/object-record/record-board/states/isMultiDragActiveComponentState';
import { originalSelectionComponentState } from '@/object-record/record-board/states/originalSelectionComponentState';
import { primaryDraggedRecordIdComponentState } from '@/object-record/record-board/states/primaryDraggedRecordIdComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { getDragOperationType } from '../utils/getDragOperationType';

export const useStartBoardCardDrag = (recordBoardId?: string) => {
  const isMultiDragActiveState = useRecoilComponentCallbackStateV2(
    isMultiDragActiveComponentState,
    recordBoardId,
  );

  const draggedRecordIdsState = useRecoilComponentCallbackStateV2(
    draggedRecordIdsComponentState,
    recordBoardId,
  );

  const primaryDraggedRecordIdState = useRecoilComponentCallbackStateV2(
    primaryDraggedRecordIdComponentState,
    recordBoardId,
  );

  const originalSelectionState = useRecoilComponentCallbackStateV2(
    originalSelectionComponentState,
    recordBoardId,
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
