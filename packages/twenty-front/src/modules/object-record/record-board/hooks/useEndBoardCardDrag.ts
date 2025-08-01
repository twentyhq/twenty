import { useRecoilCallback } from 'recoil';

import { draggedRecordIdsComponentState } from '@/object-record/record-board/states/draggedRecordIdsComponentState';
import { isMultiDragActiveComponentState } from '@/object-record/record-board/states/isMultiDragActiveComponentState';
import { originalSelectionComponentState } from '@/object-record/record-board/states/originalSelectionComponentState';
import { primaryDraggedRecordIdComponentState } from '@/object-record/record-board/states/primaryDraggedRecordIdComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';

export const useEndBoardCardDrag = (recordBoardId?: string) => {
  const isMultiDragActiveState = useRecoilComponentCallbackStateV2(
    isMultiDragActiveComponentState,
    recordBoardId,
  );

  const draggedRecordIdsState = useRecoilComponentCallbackStateV2(
    draggedRecordIdsComponentState,
    recordBoardId,
  );

  const primaryDraggedRecordIdState = useRecoilComponentCallbackStateV2(
    primaryDraggedRecordIdComponentState,
    recordBoardId,
  );

  const originalSelectionState = useRecoilComponentCallbackStateV2(
    originalSelectionComponentState,
    recordBoardId,
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
