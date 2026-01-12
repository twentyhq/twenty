import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { useEndRecordDrag } from '@/object-record/record-drag/hooks/useEndRecordDrag';
import { useProcessBoardCardDrop } from '@/object-record/record-drag/hooks/useProcessBoardCardDrop';
import { useStartRecordDrag } from '@/object-record/record-drag/hooks/useStartRecordDrag';
import { originalDragSelectionComponentState } from '@/object-record/record-drag/states/originalDragSelectionComponentState';

import { RECORD_INDEX_REMOVE_SORTING_MODAL_ID } from '@/object-record/record-index/constants/RecordIndexRemoveSortingModalId';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import {
  DragDropContext,
  type DragStart,
  type OnDragEndResponder,
} from '@hello-pangea/dnd';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

export const RecordBoardDragDropContext = ({
  children,
}: React.PropsWithChildren) => {
  const { recordBoardId } = useContext(RecordBoardContext);

  const currentRecordSortCallbackState = useRecoilComponentCallbackState(
    currentRecordSortsComponentState,
  );

  const recordBoardSelectedRecordIdsSelector = useRecoilComponentCallbackState(
    recordBoardSelectedRecordIdsComponentSelector,
    recordBoardId,
  );

  const originalDragSelectionCallbackState = useRecoilComponentCallbackState(
    originalDragSelectionComponentState,
  );

  const { startRecordDrag } = useStartRecordDrag();
  const { endRecordDrag } = useEndRecordDrag();

  const { processBoardCardDrop } = useProcessBoardCardDrop();

  const { openModal } = useModal();

  const handleDragStart = useRecoilCallback(
    ({ snapshot }) =>
      (start: DragStart) => {
        const currentSelectedRecordIds = getSnapshotValue(
          snapshot,
          recordBoardSelectedRecordIdsSelector,
        );

        startRecordDrag(start, currentSelectedRecordIds);
      },
    [recordBoardSelectedRecordIdsSelector, startRecordDrag],
  );

  const handleDragEnd: OnDragEndResponder = useRecoilCallback(
    ({ snapshot }) =>
      (result) => {
        // [FIXED]: 不要馬上 endRecordDrag，先判斷狀況，避免畫面閃爍
        
        if (!result.destination) {
          endRecordDrag(); // 沒地方放，才結束
          return;
        }

        const currentRecordSorts = getSnapshotValue(
          snapshot,
          currentRecordSortCallbackState,
        );

        if (currentRecordSorts.length > 0) {
          openModal(RECORD_INDEX_REMOVE_SORTING_MODAL_ID);
          endRecordDrag(); // 有排序擋住，結束
          return;
        }

        const originalSelection = getSnapshotValue(
          snapshot,
          originalDragSelectionCallbackState,
        );

        // [OPTIMISTIC UPDATE]: 先執行資料處理
        processBoardCardDrop(result, originalSelection);
        
        // [FIXED]: 最後才結束拖曳狀態，讓 Ghost 掩護資料更新的空窗期
        requestAnimationFrame(() => {
            endRecordDrag();
        });
      },
    [
      processBoardCardDrop,
      originalDragSelectionCallbackState,
      endRecordDrag,
      currentRecordSortCallbackState,
      openModal,
    ],
  );

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
    </DragDropContext>
  );
};
