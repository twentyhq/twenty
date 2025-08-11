import { type RecordDragContext } from '@/object-record/record-drag/shared/types/RecordDragContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { draggedRecordIdsComponentState } from '@/object-record/record-drag/board/states/draggedRecordIdsComponentState';
import { isMultiDragActiveComponentState } from '@/object-record/record-drag/board/states/isMultiDragActiveComponentState';
import { originalSelectionComponentState } from '@/object-record/record-drag/board/states/originalSelectionComponentState';
import { primaryDraggedRecordIdComponentState } from '@/object-record/record-drag/board/states/primaryDraggedRecordIdComponentState';

import { draggedRecordIdsTableComponentState } from '@/object-record/record-drag/table/states/draggedRecordIdsTableComponentState';
import { isMultiDragActiveTableComponentState } from '@/object-record/record-drag/table/states/isMultiDragActiveTableComponentState';
import { originalSelectionTableComponentState } from '@/object-record/record-drag/table/states/originalSelectionTableComponentState';
import { primaryDraggedRecordIdTableComponentState } from '@/object-record/record-drag/table/states/primaryDraggedRecordIdTableComponentState';

export const useRecordDragState = (
  context: RecordDragContext,
  instanceId?: string,
) => {
  const isDragging = useRecoilComponentValue(
    context === 'board'
      ? isMultiDragActiveComponentState
      : isMultiDragActiveTableComponentState,
    instanceId,
  );

  const draggedRecordIds = useRecoilComponentValue(
    context === 'board'
      ? draggedRecordIdsComponentState
      : draggedRecordIdsTableComponentState,
    instanceId,
  );

  const primaryDraggedRecordId = useRecoilComponentValue(
    context === 'board'
      ? primaryDraggedRecordIdComponentState
      : primaryDraggedRecordIdTableComponentState,
    instanceId,
  );

  const originalSelection = useRecoilComponentValue(
    context === 'board'
      ? originalSelectionComponentState
      : originalSelectionTableComponentState,
    instanceId,
  );

  return {
    isDragging,
    draggedRecordIds,
    primaryDraggedRecordId,
    originalSelection,
  };
};
