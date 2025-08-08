import { useRecoilCallback } from 'recoil';

import { draggedRecordIdsComponentState } from '@/object-record/record-board/states/draggedRecordIdsComponentState';
import { isMultiDragActiveComponentState } from '@/object-record/record-board/states/isMultiDragActiveComponentState';
import { originalSelectionComponentState } from '@/object-record/record-board/states/originalSelectionComponentState';
import { primaryDraggedRecordIdComponentState } from '@/object-record/record-board/states/primaryDraggedRecordIdComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';

export const useEndBoardCardDrag = (recordBoardId?: string) => {
  const isMultiDragActiveState = useRecoilComponentCallbackState(
    isMultiDragActiveComponentState,
    recordBoardId,
  );

  const draggedRecordIdsState = useRecoilComponentCallbackState(
    draggedRecordIdsComponentState,
    recordBoardId,
  );

  const primaryDraggedRecordIdState = useRecoilComponentCallbackState(
    primaryDraggedRecordIdComponentState,
    recordBoardId,
  );

  const originalSelectionState = useRecoilComponentCallbackState(
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
