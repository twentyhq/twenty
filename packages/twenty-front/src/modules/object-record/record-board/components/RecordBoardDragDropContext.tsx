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

  const currentRecordSortsAtom = useRecoilComponentStateCallbackStateV2(
    currentRecordSortsComponentState,
    recordBoardId,
  );

  const recordBoardSelectedRecordIdsAtom =
    useRecoilComponentSelectorCallbackStateV2(
      recordBoardSelectedRecordIdsComponentSelector,
      recordBoardId,
    );

  const store = useStore();

  const originalDragSelectionAtom = useRecoilComponentStateCallbackStateV2(
    originalDragSelectionComponentState,
    recordBoardId,
  );

  const { startRecordDrag } = useStartRecordDrag(recordBoardId);
  const { endRecordDrag } = useEndRecordDrag(recordBoardId);

  const { processBoardCardDrop } = useProcessBoardCardDrop();

  const { openModal } = useModal();

  const handleDragStart = useCallback(
    (start: DragStart) => {
      const currentSelectedRecordIds = store.get(
        recordBoardSelectedRecordIdsAtom,
      );

      startRecordDrag(start, currentSelectedRecordIds);
    },
    [recordBoardSelectedRecordIdsAtom, startRecordDrag, store],
  );

  const handleDragEnd: OnDragEndResponder = useCallback(
    (result) => {
      endRecordDrag();

      if (!result.destination) return;

      const currentRecordSorts = store.get(currentRecordSortsAtom);

      if (currentRecordSorts.length > 0) {
        openModal(RECORD_INDEX_REMOVE_SORTING_MODAL_ID);
        return;
      }

      const originalSelection = store.get(
        originalDragSelectionAtom,
      ) as string[];

      processBoardCardDrop(result, originalSelection);
    },
    [
      processBoardCardDrop,
      originalDragSelectionAtom,
      endRecordDrag,
      currentRecordSortsAtom,
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
