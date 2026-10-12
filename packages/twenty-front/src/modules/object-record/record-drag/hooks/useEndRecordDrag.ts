import { useStore } from 'jotai';
import { useCallback } from 'react';

import { draggedRecordIdsComponentState } from '@/object-record/record-drag/states/draggedRecordIdsComponentState';
import { isDraggingRecordComponentState } from '@/object-record/record-drag/states/isDraggingRecordComponentState';
import { isRecordIdSecondaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdSecondaryDragMultipleComponentFamilyState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useEndRecordDrag = () => {
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

  const endRecordDrag = useCallback(() => {
    for (const recordId of store.get(draggedRecordIdsCallbackState)) {
      store.set(
        isRecordIdSecondaryDragMultipleCallbackState({ recordId }),
        false,
      );
    }

    store.set(draggedRecordIdsCallbackState, []);
    store.set(isDraggingRecordCallbackState, false);
  }, [
    store,
    isDraggingRecordCallbackState,
    draggedRecordIdsCallbackState,
    isRecordIdSecondaryDragMultipleCallbackState,
  ]);

  return { endRecordDrag };
};
