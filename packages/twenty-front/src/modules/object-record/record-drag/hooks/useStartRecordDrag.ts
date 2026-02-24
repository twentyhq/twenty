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
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { type DragStart } from '@hello-pangea/dnd';

export const useStartRecordDrag = (contextStoreInstanceId?: string) => {
  const store = useStore();
  const isMultiDragActiveCallbackState = useRecoilComponentStateCallbackStateV2(
    isMultiDragActiveComponentState,
    contextStoreInstanceId,
  );

  const draggedRecordIdsCallbackState = useRecoilComponentStateCallbackStateV2(
    draggedRecordIdsComponentState,
    contextStoreInstanceId,
  );

  const isRecordIdPrimaryDragMultipleCallbackState =
    useRecoilComponentFamilyStateCallbackStateV2(
      isRecordIdPrimaryDragMultipleComponentFamilyState,
      contextStoreInstanceId,
    );

  const isRecordIdSecondaryDragMultipleCallbackState =
    useRecoilComponentFamilyStateCallbackStateV2(
      isRecordIdSecondaryDragMultipleComponentFamilyState,
      contextStoreInstanceId,
    );

  const primaryDraggedRecordIdCallbackState =
    useRecoilComponentStateCallbackStateV2(
      primaryDraggedRecordIdComponentState,
      contextStoreInstanceId,
    );

  const originalSelection = useRecoilComponentStateCallbackStateV2(
    originalDragSelectionComponentState,
    contextStoreInstanceId,
  );

  const isDraggingRecord = useRecoilComponentStateCallbackStateV2(
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
