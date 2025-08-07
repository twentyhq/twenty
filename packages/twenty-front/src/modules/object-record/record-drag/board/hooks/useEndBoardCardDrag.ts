import { useRecoilCallback } from 'recoil';

import { draggedRecordIdsComponentState } from '@/object-record/record-drag/board/states/draggedRecordIdsComponentState';
import { isMultiDragActiveComponentState } from '@/object-record/record-drag/board/states/isMultiDragActiveComponentState';
import { originalSelectionComponentState } from '@/object-record/record-drag/board/states/originalSelectionComponentState';
import { primaryDraggedRecordIdComponentState } from '@/object-record/record-drag/board/states/primaryDraggedRecordIdComponentState';
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

  const endDrag = useRecoilCallback(
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

  return { endDrag };
};
