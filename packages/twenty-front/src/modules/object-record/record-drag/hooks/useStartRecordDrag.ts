import { draggedRecordIdsComponentState } from '@/object-record/record-drag/states/draggedRecordIdsComponentState';
import { isDraggingRecordComponentState } from '@/object-record/record-drag/states/isDraggingRecordComponentState';
import { isMultiDragActiveComponentState } from '@/object-record/record-drag/states/isMultiDragActiveComponentState';
import { isRecordIdPrimaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdPrimaryDragMultipleComponentFamilyState';
import { isRecordIdSecondaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdSecondaryDragMultipleComponentFamilyState';
import { originalDragSelectionComponentState } from '@/object-record/record-drag/states/originalDragSelectionComponentState';

import { primaryDraggedRecordIdComponentState } from '@/object-record/record-drag/states/primaryDraggedRecordIdComponentState';
import { getDragOperationType } from '@/object-record/record-drag/utils/getDragOperationType';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { type DragStart } from '@hello-pangea/dnd';
import { useRecoilCallback } from 'recoil';

export const useStartRecordDrag = (contextStoreInstanceId?: string) => {
  const isMultiDragActiveCallbackState = useRecoilComponentCallbackState(
    isMultiDragActiveComponentState,
    contextStoreInstanceId,
  );

  const draggedRecordIdsCallbackState = useRecoilComponentCallbackState(
    draggedRecordIdsComponentState,
    contextStoreInstanceId,
  );

  const isRecordIdPrimaryDragMultipleCallbackState =
    useRecoilComponentCallbackState(
      isRecordIdPrimaryDragMultipleComponentFamilyState,
      contextStoreInstanceId,
    );

  const isRecordIdSecondaryDragMultipleCallbackState =
    useRecoilComponentCallbackState(
      isRecordIdSecondaryDragMultipleComponentFamilyState,
      contextStoreInstanceId,
    );

  const primaryDraggedRecordIdCallbackState = useRecoilComponentCallbackState(
    primaryDraggedRecordIdComponentState,
    contextStoreInstanceId,
  );

  const originalSelectionCallbackState = useRecoilComponentCallbackState(
    originalDragSelectionComponentState,
    contextStoreInstanceId,
  );

  const isDraggingRecordCallbackState = useRecoilComponentCallbackState(
    isDraggingRecordComponentState,
    contextStoreInstanceId,
  );

  const startRecordDrag = useRecoilCallback(
    ({ set }) =>
      (start: DragStart, selectedRecordIds: string[]) => {
        set(isDraggingRecordCallbackState, true);

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

          set(
            isRecordIdPrimaryDragMultipleCallbackState({
              recordId: draggedRecordId,
            }),
            true,
          );

          const secondaryDraggedIds = selectedRecordIds.filter(
            (recordIdToFilter) => recordIdToFilter !== draggedRecordId,
          );

          for (const secondaryDraggedId of secondaryDraggedIds) {
            set(
              isRecordIdSecondaryDragMultipleCallbackState({
                recordId: secondaryDraggedId,
              }),
              true,
            );
          }
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
      isDraggingRecordCallbackState,
      isRecordIdSecondaryDragMultipleCallbackState,
      isRecordIdPrimaryDragMultipleCallbackState,
    ],
  );

  return {
    startRecordDrag,
  };
};
