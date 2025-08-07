import { useRecoilCallback } from 'recoil';

import { draggedRecordIdsTableComponentState } from '@/object-record/record-table/states/draggedRecordIdsTableComponentState';
import { isMultiDragActiveTableComponentState } from '@/object-record/record-table/states/isMultiDragActiveTableComponentState';
import { originalSelectionTableComponentState } from '@/object-record/record-table/states/originalSelectionTableComponentState';
import { primaryDraggedRecordIdTableComponentState } from '@/object-record/record-table/states/primaryDraggedRecordIdTableComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';

export const useEndTableRowDrag = (recordTableId?: string) => {
  const isMultiDragActiveState = useRecoilComponentCallbackState(
    isMultiDragActiveTableComponentState,
    recordTableId,
  );

  const draggedRecordIdsState = useRecoilComponentCallbackState(
    draggedRecordIdsTableComponentState,
    recordTableId,
  );

  const primaryDraggedRecordIdState = useRecoilComponentCallbackState(
    primaryDraggedRecordIdTableComponentState,
    recordTableId,
  );

  const originalSelectionState = useRecoilComponentCallbackState(
    originalSelectionTableComponentState,
    recordTableId,
  );

  return useRecoilCallback(
    ({ set }) =>
      () => {
        set(isMultiDragActiveState, false);
        set(draggedRecordIdsState, []);
        set(primaryDraggedRecordIdState, null);
        set(originalSelectionState, []);
      },
    [
      isMultiDragActiveState,
      draggedRecordIdsState,
      primaryDraggedRecordIdState,
      originalSelectionState,
    ],
  );
};
