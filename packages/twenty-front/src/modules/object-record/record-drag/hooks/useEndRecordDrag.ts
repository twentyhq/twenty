import { useCallback } from 'react';
import { useStore } from 'jotai';

import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';

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
  const isMultiDragActiveCallbackState = useRecoilComponentStateCallbackStateV2(
    isMultiDragActiveComponentState,
    contextStoreInstanceId,
  );

  const draggedRecordIdsCallbackState = useRecoilComponentStateCallbackStateV2(
    draggedRecordIdsComponentState,
    contextStoreInstanceId,
  );

  const primaryDraggedRecordIdCallbackState =
    useRecoilComponentStateCallbackStateV2(
      primaryDraggedRecordIdComponentState,
      contextStoreInstanceId,
    );

  const originalSelectionAtom = useRecoilComponentStateCallbackStateV2(
    originalDragSelectionComponentState,
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

  const isDraggingRecordAtom = useRecoilComponentStateCallbackStateV2(
    isDraggingRecordComponentState,
    contextStoreInstanceId,
  );

  const endRecordDrag = useCallback(() => {
    store.set(isDraggingRecordAtom, false);

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
    store.set(originalSelectionAtom, []);
  }, [
    store,
    isMultiDragActiveCallbackState,
    draggedRecordIdsCallbackState,
    primaryDraggedRecordIdCallbackState,
    originalSelectionAtom,
    isRecordIdPrimaryDragMultipleCallbackState,
    isRecordIdSecondaryDragMultipleCallbackState,
    isDraggingRecordAtom,
  ]);

  return { endRecordDrag };
};
