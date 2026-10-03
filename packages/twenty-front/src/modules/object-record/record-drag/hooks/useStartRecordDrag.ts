import { useStore } from 'jotai';
import { useCallback } from 'react';

import { draggedRecordIdsComponentState } from '@/object-record/record-drag/states/draggedRecordIdsComponentState';
import { isDraggingRecordComponentState } from '@/object-record/record-drag/states/isDraggingRecordComponentState';
import { isRecordIdSecondaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdSecondaryDragMultipleComponentFamilyState';
import { getDragOperationType } from '@/object-record/record-drag/utils/getDragOperationType';
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

  const startRecordDrag = useCallback(
    (draggedRecordId: string, selectedRecordIds: string[]) => {
      // Dragging a selected record moves the whole selection
      const draggedRecordIds =
        getDragOperationType({ draggedRecordId, selectedRecordIds }) === 'multi'
          ? selectedRecordIds
          : [draggedRecordId];

      store.set(isDraggingRecordCallbackState, true);
      store.set(draggedRecordIdsCallbackState, draggedRecordIds);

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
    ],
  );

  return { startRecordDrag };
};
