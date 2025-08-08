import { draggedRecordIdsComponentState } from '@/object-record/record-board/states/draggedRecordIdsComponentState';
import { isMultiDragActiveComponentState } from '@/object-record/record-board/states/isMultiDragActiveComponentState';
import { originalSelectionComponentState } from '@/object-record/record-board/states/originalSelectionComponentState';
import { primaryDraggedRecordIdComponentState } from '@/object-record/record-board/states/primaryDraggedRecordIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const useBoardCardDragState = (recordBoardId?: string) => {
  const isDragging = useRecoilComponentValue(
    isMultiDragActiveComponentState,
    recordBoardId,
  );

  const draggedRecordIds = useRecoilComponentValue(
    draggedRecordIdsComponentState,
    recordBoardId,
  );

  const primaryDraggedRecordId = useRecoilComponentValue(
    primaryDraggedRecordIdComponentState,
    recordBoardId,
  );

  const originalSelection = useRecoilComponentValue(
    originalSelectionComponentState,
    recordBoardId,
  );

  return {
    isDragging,
    draggedRecordIds,
    primaryDraggedRecordId,
    originalSelection,
  };
};
