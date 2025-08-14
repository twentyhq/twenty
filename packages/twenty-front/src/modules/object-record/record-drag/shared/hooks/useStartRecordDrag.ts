import { type DragStart } from '@hello-pangea/dnd';
import { useRecoilCallback } from 'recoil';

import { type RecordDragContext } from '@/object-record/record-drag/shared/types/RecordDragContext';
import { getDragOperationType } from '@/object-record/record-drag/shared/utils/getDragOperationType';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';

import { draggedRecordIdsComponentState } from '@/object-record/record-drag/board/states/draggedRecordIdsComponentState';
import { isMultiDragActiveComponentState } from '@/object-record/record-drag/board/states/isMultiDragActiveComponentState';
import { originalSelectionComponentState } from '@/object-record/record-drag/board/states/originalSelectionComponentState';
import { primaryDraggedRecordIdComponentState } from '@/object-record/record-drag/board/states/primaryDraggedRecordIdComponentState';

import { draggedRecordIdsTableComponentState } from '@/object-record/record-drag/table/states/draggedRecordIdsTableComponentState';
import { isMultiDragActiveTableComponentState } from '@/object-record/record-drag/table/states/isMultiDragActiveTableComponentState';
import { originalSelectionTableComponentState } from '@/object-record/record-drag/table/states/originalSelectionTableComponentState';
import { primaryDraggedRecordIdTableComponentState } from '@/object-record/record-drag/table/states/primaryDraggedRecordIdTableComponentState';

export const useStartRecordDrag = (
  context: RecordDragContext,
  instanceId?: string,
) => {
  const isMultiDragActiveCallbackState = useRecoilComponentCallbackState(
    context === 'board'
      ? isMultiDragActiveComponentState
      : isMultiDragActiveTableComponentState,
    instanceId,
  );

  const draggedRecordIdsCallbackState = useRecoilComponentCallbackState(
    context === 'board'
      ? draggedRecordIdsComponentState
      : draggedRecordIdsTableComponentState,
    instanceId,
  );

  const primaryDraggedRecordIdCallbackState = useRecoilComponentCallbackState(
    context === 'board'
      ? primaryDraggedRecordIdComponentState
      : primaryDraggedRecordIdTableComponentState,
    instanceId,
  );

  const originalSelectionCallbackState = useRecoilComponentCallbackState(
    context === 'board'
      ? originalSelectionComponentState
      : originalSelectionTableComponentState,
    instanceId,
  );

  const startDrag = useRecoilCallback(
    ({ set }) =>
      (start: DragStart, selectedRecordIds: string[]) => {
        const draggedRecordId = start.draggableId;

        const dragOperationType = getDragOperationType({
          draggedRecordId,
          selectedRecordIds,
        });

        if (dragOperationType === 'multi') {
          set(isMultiDragActiveCallbackState, true);
          set(draggedRecordIdsCallbackState, selectedRecordIds);
          set(primaryDraggedRecordIdCallbackState, draggedRecordId);
          set(originalSelectionCallbackState, selectedRecordIds);
        } else {
          set(isMultiDragActiveCallbackState, true);
          set(draggedRecordIdsCallbackState, [draggedRecordId]);
          set(primaryDraggedRecordIdCallbackState, draggedRecordId);
          set(originalSelectionCallbackState, [draggedRecordId]);
        }
      },
    [
      isMultiDragActiveCallbackState,
      draggedRecordIdsCallbackState,
      primaryDraggedRecordIdCallbackState,
      originalSelectionCallbackState,
    ],
  );

  return { startDrag };
};
