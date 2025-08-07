import { draggedRecordIdsTableComponentState } from '@/object-record/record-drag/table/states/draggedRecordIdsTableComponentState';
import { isMultiDragActiveTableComponentState } from '@/object-record/record-drag/table/states/isMultiDragActiveTableComponentState';
import { originalSelectionTableComponentState } from '@/object-record/record-drag/table/states/originalSelectionTableComponentState';
import { primaryDraggedRecordIdTableComponentState } from '@/object-record/record-drag/table/states/primaryDraggedRecordIdTableComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const useTableRowDragState = (recordTableId?: string) => {
  const isDragging = useRecoilComponentValue(
    isMultiDragActiveTableComponentState,
    recordTableId,
  );

  const draggedRecordIds = useRecoilComponentValue(
    draggedRecordIdsTableComponentState,
    recordTableId,
  );

  const primaryDraggedRecordId = useRecoilComponentValue(
    primaryDraggedRecordIdTableComponentState,
    recordTableId,
  );

  const originalSelection = useRecoilComponentValue(
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
