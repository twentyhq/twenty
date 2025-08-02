import { draggedRecordIdsTableComponentState } from '@/object-record/record-table/states/draggedRecordIdsTableComponentState';
import { isMultiDragActiveTableComponentState } from '@/object-record/record-table/states/isMultiDragActiveTableComponentState';
import { originalSelectionTableComponentState } from '@/object-record/record-table/states/originalSelectionTableComponentState';
import { primaryDraggedRecordIdTableComponentState } from '@/object-record/record-table/states/primaryDraggedRecordIdTableComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const useTableRowDragState = (recordTableId?: string) => {
  const isDragging = useRecoilComponentValueV2(
    isMultiDragActiveTableComponentState,
    recordTableId,
  );

  const draggedRecordIds = useRecoilComponentValueV2(
    draggedRecordIdsTableComponentState,
    recordTableId,
  );

  const primaryDraggedRecordId = useRecoilComponentValueV2(
    primaryDraggedRecordIdTableComponentState,
    recordTableId,
  );

  const originalSelection = useRecoilComponentValueV2(
    originalSelectionTableComponentState,
    recordTableId,
  );

  return {
    isDragging,
    draggedRecordIds,
    primaryDraggedRecordId,
    originalSelection,
  };
};
