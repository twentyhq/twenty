import { draggedRecordIdsComponentState } from '@/object-record/record-board/states/draggedRecordIdsComponentState';
import { isMultiDragActiveComponentState } from '@/object-record/record-board/states/isMultiDragActiveComponentState';
import { originalSelectionComponentState } from '@/object-record/record-board/states/originalSelectionComponentState';
import { primaryDraggedRecordIdComponentState } from '@/object-record/record-board/states/primaryDraggedRecordIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const useBoardCardDragState = (recordBoardId?: string) => {
  const isDragging = useRecoilComponentValueV2(
    isMultiDragActiveComponentState,
    recordBoardId,
  );

  const draggedRecordIds = useRecoilComponentValueV2(
    draggedRecordIdsComponentState,
    recordBoardId,
  );

  const primaryDraggedRecordId = useRecoilComponentValueV2(
    primaryDraggedRecordIdComponentState,
    recordBoardId,
  );

  const originalSelection = useRecoilComponentValueV2(
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
