import { useStore } from 'jotai';
import { useCallback } from 'react';

import { draggedRecordIdsComponentState } from '@/object-record/record-drag/states/draggedRecordIdsComponentState';
import { isDraggingRecordComponentState } from '@/object-record/record-drag/states/isDraggingRecordComponentState';
import { isRecordIdPrimaryDragComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdPrimaryDragComponentFamilyState';
import { isRecordIdSecondaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdSecondaryDragMultipleComponentFamilyState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useStartRecordDrag = () => {
  const store = useStore();

  const isDraggingRecordCallbackState = useAtomComponentStateCallbackState(
    isDraggingRecordComponentState,
  );
  const draggedRecordIdsCallbackState = useAtomComponentStateCallbackState(
    draggedRecordIdsComponentState,
  );
  const isRecordIdSecondaryDragMultipleCallbackState =
    useAtomComponentFamilyStateCallbackState(
      isRecordIdSecondaryDragMultipleComponentFamilyState,
    );
  const isRecordIdPrimaryDragCallbackState =
    useAtomComponentFamilyStateCallbackState(
      isRecordIdPrimaryDragComponentFamilyState,
    );

  const startRecordDrag = useCallback(
    (draggedRecordId: string, selectedRecordIds: string[]) => {
      // Dragging a selected record moves the whole selection
      const draggedRecordIds =
        selectedRecordIds.includes(draggedRecordId) &&
        selectedRecordIds.length > 1
          ? selectedRecordIds
          : [draggedRecordId];

      store.set(isDraggingRecordCallbackState, true);
      store.set(draggedRecordIdsCallbackState, draggedRecordIds);
      store.set(
        isRecordIdPrimaryDragCallbackState({ recordId: draggedRecordId }),
        true,
      );

      for (const recordId of draggedRecordIds) {
        if (recordId !== draggedRecordId) {
          store.set(
            isRecordIdSecondaryDragMultipleCallbackState({ recordId }),
            true,
          );
        }
      }
    },
    [
      store,
      isDraggingRecordCallbackState,
      draggedRecordIdsCallbackState,
      isRecordIdSecondaryDragMultipleCallbackState,
      isRecordIdPrimaryDragCallbackState,
    ],
  );

  return { startRecordDrag };
};
