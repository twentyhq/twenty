import { useCallback } from 'react';
import { useStore } from 'jotai';

import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

import { isMultiDragActiveComponentState } from '@/object-record/record-drag/states/isMultiDragActiveComponentState';

import { draggedRecordIdsComponentState } from '@/object-record/record-drag/states/draggedRecordIdsComponentState';
import { isDraggingRecordComponentState } from '@/object-record/record-drag/states/isDraggingRecordComponentState';
import { isRecordIdPrimaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdPrimaryDragMultipleComponentFamilyState';
import { isRecordIdSecondaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdSecondaryDragMultipleComponentFamilyState';
import { originalDragSelectionComponentState } from '@/object-record/record-drag/states/originalDragSelectionComponentState';
import { primaryDraggedRecordIdComponentState } from '@/object-record/record-drag/states/primaryDraggedRecordIdComponentState';
import { isDefined } from 'twenty-shared/utils';

export const useEndRecordDrag = (contextStoreInstanceId?: string) => {
  const store = useStore();
  const isMultiDragActiveCallbackState = useAtomComponentStateCallbackState(
    isMultiDragActiveComponentState,
    contextStoreInstanceId,
  );

  const draggedRecordIdsCallbackState = useAtomComponentStateCallbackState(
    draggedRecordIdsComponentState,
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

  const isDraggingRecord = useAtomComponentStateCallbackState(
    isDraggingRecordComponentState,
    contextStoreInstanceId,
  );

  const endRecordDrag = useCallback(() => {
    store.set(isDraggingRecord, false);

    const currentlyDraggedRecordIds = store.get(draggedRecordIdsCallbackState);

    const primaryDraggedRecordId = store.get(
      primaryDraggedRecordIdCallbackState,
    );

    if (currentlyDraggedRecordIds.length > 0) {
      const secondaryDraggedIds = currentlyDraggedRecordIds.filter(
        (recordIdToFilter) => recordIdToFilter !== primaryDraggedRecordId,
      );

      for (const secondaryDraggedId of secondaryDraggedIds) {
        store.set(
          isRecordIdSecondaryDragMultipleCallbackState({
            recordId: secondaryDraggedId,
          }),
          false,
        );
      }
    }

    if (isDefined(primaryDraggedRecordId)) {
      store.set(
        isRecordIdPrimaryDragMultipleCallbackState({
          recordId: primaryDraggedRecordId,
        }),
        false,
      );
    }

    store.set(isMultiDragActiveCallbackState, false);
    store.set(draggedRecordIdsCallbackState, []);
    store.set(primaryDraggedRecordIdCallbackState, null);
    store.set(originalSelection, []);
  }, [
    store,
    isMultiDragActiveCallbackState,
    draggedRecordIdsCallbackState,
    primaryDraggedRecordIdCallbackState,
    originalSelection,
    isRecordIdPrimaryDragMultipleCallbackState,
    isRecordIdSecondaryDragMultipleCallbackState,
    isDraggingRecord,
  ]);

  return { endRecordDrag };
};
