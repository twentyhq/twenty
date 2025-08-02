import { useRecoilCallback } from 'recoil';

import { draggedRecordIdsTableComponentState } from '@/object-record/record-table/states/draggedRecordIdsTableComponentState';
import { isMultiDragActiveTableComponentState } from '@/object-record/record-table/states/isMultiDragActiveTableComponentState';
import { originalSelectionTableComponentState } from '@/object-record/record-table/states/originalSelectionTableComponentState';
import { primaryDraggedRecordIdTableComponentState } from '@/object-record/record-table/states/primaryDraggedRecordIdTableComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';

export const useEndTableRowDrag = (recordTableId?: string) => {
  const isMultiDragActiveState = useRecoilComponentCallbackStateV2(
    isMultiDragActiveTableComponentState,
    recordTableId,
  );

  const draggedRecordIdsState = useRecoilComponentCallbackStateV2(
    draggedRecordIdsTableComponentState,
    recordTableId,
  );

  const primaryDraggedRecordIdState = useRecoilComponentCallbackStateV2(
    primaryDraggedRecordIdTableComponentState,
    recordTableId,
  );

  const originalSelectionState = useRecoilComponentCallbackStateV2(
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
