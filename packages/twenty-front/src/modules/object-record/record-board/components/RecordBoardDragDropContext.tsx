import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { useEndRecordDrag } from '@/object-record/record-drag/hooks/useEndRecordDrag';
import { useProcessBoardCardDrop } from '@/object-record/record-drag/hooks/useProcessBoardCardDrop';
import { useStartRecordDrag } from '@/object-record/record-drag/hooks/useStartRecordDrag';
import { originalDragSelectionComponentState } from '@/object-record/record-drag/states/originalDragSelectionComponentState';

import { RECORD_INDEX_REMOVE_SORTING_MODAL_ID } from '@/object-record/record-index/constants/RecordIndexRemoveSortingModalId';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useRecoilComponentSelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorCallbackStateV2';
import { useStore } from 'jotai';
import {
  DragDropContext,
  type DragStart,
  type OnDragEndResponder,
} from '@hello-pangea/dnd';
import { useCallback, useContext } from 'react';

export const RecordBoardDragDropContext = ({
  children,
}: React.PropsWithChildren) => {
  const { recordBoardId } = useContext(RecordBoardContext);

  const currentRecordSorts = useRecoilComponentStateCallbackStateV2(
    currentRecordSortsComponentState,
    recordBoardId,
  );

  const recordBoardSelectedRecordIds =
    useRecoilComponentSelectorCallbackStateV2(
      recordBoardSelectedRecordIdsComponentSelector,
      recordBoardId,
    );

  const store = useStore();

  const originalDragSelection = useRecoilComponentStateCallbackStateV2(
    originalDragSelectionComponentState,
    recordBoardId,
  );

  const { startRecordDrag } = useStartRecordDrag(recordBoardId);
  const { endRecordDrag } = useEndRecordDrag(recordBoardId);

  const { processBoardCardDrop } = useProcessBoardCardDrop();

  const { openModal } = useModal();

  const handleDragStart = useCallback(
    (start: DragStart) => {
      const currentSelectedRecordIds = store.get(recordBoardSelectedRecordIds);

      startRecordDrag(start, currentSelectedRecordIds);
    },
    [recordBoardSelectedRecordIds, startRecordDrag, store],
  );

  const handleDragEnd: OnDragEndResponder = useCallback(
    (result) => {
      endRecordDrag();

      if (!result.destination) return;

      const existingRecordSorts = store.get(currentRecordSorts);

      if (existingRecordSorts.length > 0) {
        openModal(RECORD_INDEX_REMOVE_SORTING_MODAL_ID);
        return;
      }

      const originalSelection = store.get(originalDragSelection) as string[];

      processBoardCardDrop(result, originalSelection);
    },
    [
      processBoardCardDrop,
      originalDragSelection,
      endRecordDrag,
      currentRecordSorts,
      openModal,
      store,
    ],
  );

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
    </DragDropContext>
  );
};
