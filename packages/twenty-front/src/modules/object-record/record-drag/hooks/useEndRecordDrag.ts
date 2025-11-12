import { useRecoilCallback } from 'recoil';

import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';

import { isMultiDragActiveComponentState } from '@/object-record/record-drag/states/isMultiDragActiveComponentState';

import { draggedRecordIdsComponentState } from '@/object-record/record-drag/states/draggedRecordIdsComponentState';
import { isDraggingRecordComponentState } from '@/object-record/record-drag/states/isDraggingRecordComponentState';
import { isRecordIdPrimaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdPrimaryDragMultipleComponentFamilyState';
import { isRecordIdSecondaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdSecondaryDragMultipleComponentFamilyState';
import { originalDragSelectionComponentState } from '@/object-record/record-drag/states/originalDragSelectionComponentState';
import { primaryDraggedRecordIdComponentState } from '@/object-record/record-drag/states/primaryDraggedRecordIdComponentState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { isDefined } from 'twenty-shared/utils';

export const useEndRecordDrag = (contextStoreInstanceId?: string) => {
  const isMultiDragActiveCallbackState = useRecoilComponentCallbackState(
    isMultiDragActiveComponentState,
    contextStoreInstanceId,
  );

  const draggedRecordIdsCallbackState = useRecoilComponentCallbackState(
    draggedRecordIdsComponentState,
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

  const isDraggingRecordCallbackState = useRecoilComponentCallbackState(
    isDraggingRecordComponentState,
    contextStoreInstanceId,
  );

  const endRecordDrag = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        set(isDraggingRecordCallbackState, false);

        const currentlyDraggedRecordIds = getSnapshotValue(
          snapshot,
          draggedRecordIdsCallbackState,
        );

        const primaryDraggedRecordId = getSnapshotValue(
          snapshot,
          primaryDraggedRecordIdCallbackState,
        );

        if (currentlyDraggedRecordIds.length > 0) {
          const secondaryDraggedIds = currentlyDraggedRecordIds.filter(
            (recordIdToFilter) => recordIdToFilter !== primaryDraggedRecordId,
          );

          for (const secondaryDraggedId of secondaryDraggedIds) {
            set(
              isRecordIdSecondaryDragMultipleCallbackState({
                recordId: secondaryDraggedId,
              }),
              false,
            );
          }
        }

        if (isDefined(primaryDraggedRecordId)) {
          set(
            isRecordIdPrimaryDragMultipleCallbackState({
              recordId: primaryDraggedRecordId,
            }),
            false,
          );
        }

        set(isMultiDragActiveCallbackState, false);
        set(draggedRecordIdsCallbackState, []);
        set(primaryDraggedRecordIdCallbackState, null);
        set(originalSelectionCallbackState, []);
      },
    [
      isMultiDragActiveCallbackState,
      draggedRecordIdsCallbackState,
      primaryDraggedRecordIdCallbackState,
      originalSelectionCallbackState,
      isRecordIdPrimaryDragMultipleCallbackState,
      isRecordIdSecondaryDragMultipleCallbackState,
      isDraggingRecordCallbackState,
    ],
  );

  return { endRecordDrag };
};
