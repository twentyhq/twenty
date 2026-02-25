import { useCallback } from 'react';
import { useStore } from 'jotai';

import { draggedRecordIdsComponentState } from '@/object-record/record-drag/states/draggedRecordIdsComponentState';
import { isDraggingRecordComponentState } from '@/object-record/record-drag/states/isDraggingRecordComponentState';
import { isMultiDragActiveComponentState } from '@/object-record/record-drag/states/isMultiDragActiveComponentState';
import { isRecordIdPrimaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdPrimaryDragMultipleComponentFamilyState';
import { isRecordIdSecondaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdSecondaryDragMultipleComponentFamilyState';
import { originalDragSelectionComponentState } from '@/object-record/record-drag/states/originalDragSelectionComponentState';

import { primaryDraggedRecordIdComponentState } from '@/object-record/record-drag/states/primaryDraggedRecordIdComponentState';
import { getDragOperationType } from '@/object-record/record-drag/utils/getDragOperationType';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { type DragStart } from '@hello-pangea/dnd';

export const useStartRecordDrag = (contextStoreInstanceId?: string) => {
  const store = useStore();
  const isMultiDragActiveCallbackState = useAtomComponentStateCallbackState(
    isMultiDragActiveComponentState,
    contextStoreInstanceId,
  );

  const draggedRecordIdsCallbackState = useAtomComponentStateCallbackState(
    draggedRecordIdsComponentState,
    contextStoreInstanceId,
  );

  const isRecordIdPrimaryDragMultipleCallbackState =
    useAtomComponentFamilyStateCallbackState(
      isRecordIdPrimaryDragMultipleComponentFamilyState,
      contextStoreInstanceId,
    );

  const isRecordIdSecondaryDragMultipleCallbackState =
    useAtomComponentFamilyStateCallbackState(
      isRecordIdSecondaryDragMultipleComponentFamilyState,
      contextStoreInstanceId,
    );

  const primaryDraggedRecordIdCallbackState =
    useAtomComponentStateCallbackState(
      primaryDraggedRecordIdComponentState,
      contextStoreInstanceId,
    );

  const originalSelection = useAtomComponentStateCallbackState(
    originalDragSelectionComponentState,
    contextStoreInstanceId,
  );

  const isDraggingRecord = useAtomComponentStateCallbackState(
    isDraggingRecordComponentState,
    contextStoreInstanceId,
  );

  const startRecordDrag = useCallback(
    (start: DragStart, selectedRecordIds: string[]) => {
      store.set(isDraggingRecord, true);

      const draggedRecordId = start.draggableId;

      const dragOperationType = getDragOperationType({
        draggedRecordId,
        selectedRecordIds,
      });

      if (dragOperationType === 'multi') {
        store.set(isMultiDragActiveCallbackState, true);
        store.set(draggedRecordIdsCallbackState, selectedRecordIds);
        store.set(primaryDraggedRecordIdCallbackState, draggedRecordId);
        store.set(originalSelection, selectedRecordIds);

        store.set(
          isRecordIdPrimaryDragMultipleCallbackState({
            recordId: draggedRecordId,
          }),
          true,
        );

        const secondaryDraggedIds = selectedRecordIds.filter(
          (recordIdToFilter) => recordIdToFilter !== draggedRecordId,
        );

        for (const secondaryDraggedId of secondaryDraggedIds) {
          store.set(
            isRecordIdSecondaryDragMultipleCallbackState({
              recordId: secondaryDraggedId,
            }),
            true,
          );
        }
      } else {
        store.set(isMultiDragActiveCallbackState, true);
        store.set(draggedRecordIdsCallbackState, [draggedRecordId]);
        store.set(primaryDraggedRecordIdCallbackState, draggedRecordId);
        store.set(originalSelection, [draggedRecordId]);
      }
    },
    [
      store,
      isMultiDragActiveCallbackState,
      draggedRecordIdsCallbackState,
      primaryDraggedRecordIdCallbackState,
      originalSelection,
      isDraggingRecord,
      isRecordIdSecondaryDragMultipleCallbackState,
      isRecordIdPrimaryDragMultipleCallbackState,
    ],
  );

  return {
    startRecordDrag,
  };
};
