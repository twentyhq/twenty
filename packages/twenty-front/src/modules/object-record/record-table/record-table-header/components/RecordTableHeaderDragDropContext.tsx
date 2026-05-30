import { isRecordBoardDropProcessingComponentState } from '@/object-record/record-board/states/isRecordBoardDropProcessingComponentState';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { useEndRecordDrag } from '@/object-record/record-drag/hooks/useEndRecordDrag';
import { useProcessBoardCardDrop } from '@/object-record/record-drag/hooks/useProcessBoardCardDrop';
import { useStartRecordDrag } from '@/object-record/record-drag/hooks/useStartRecordDrag';
import { originalDragSelectionComponentState } from '@/object-record/record-drag/states/originalDragSelectionComponentState';

import { RECORD_INDEX_REMOVE_SORTING_MODAL_ID } from '@/object-record/record-index/constants/RecordIndexRemoveSortingModalId';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import {
  DragDropContext,
  type DragStart,
  type OnDragEndResponder,
} from '@hello-pangea/dnd';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const RecordTableHeaderDragDropContext = ({
  children,
}: React.PropsWithChildren) => {
  const { recordTableId } = useRecordTableContextOrThrow();

  // const currentRecordSorts = useAtomComponentStateCallbackState(
  //   currentRecordSortsComponentState,
  //   recordTableId,
  // );

  const store = useStore();

  const originalDragSelectionCallbackState = useAtomComponentStateCallbackState(
    originalDragSelectionComponentState,
    recordTableId,
  );

  const { startRecordDrag } = useStartRecordDrag(recordTableId);
  const { endRecordDrag } = useEndRecordDrag(recordTableId);

  // const { processBoardCardDrop } = useProcessBoardCardDrop();

  // const isRecordBoardDropProcessingCallbackState =
  //   useAtomComponentStateCallbackState(
  //     isRecordBoardDropProcessingComponentState,
  //   );

  const { openModal } = useModal();

  // const handleDragStart = useCallback(
  //   (start: DragStart) => {
  //
  //     // store.set(isRecordBoardDropProcessingCallbackState, true);
  //
  //     // startRecordDrag(start, currentSelectedRecordIds);
  //   },
  //   [
  //     // recordBoardSelectedRecordIds,
  //     startRecordDrag,
  //     store,
  //     // isRecordBoardDropProcessingCallbackState,
  //   ],
  // );

  const handleDragEnd: OnDragEndResponder = useCallback(
    (result) => {
      const originalDragSelection = store.get(
        originalDragSelectionCallbackState,
      );

      if (!result.destination) {
        // store.set(isRecordBoardDropProcessingCallbackState, false);
        endRecordDrag();
        return;
      }

      // const existingRecordSorts = store.get(currentRecordSorts);

      // if (existingRecordSorts.length > 0) {
      //   // store.set(isRecordBoardDropProcessingCallbackState, false);
      //   endRecordDrag();
      //   openModal(RECORD_INDEX_REMOVE_SORTING_MODAL_ID);
      //   return;
      // }

      try {
        // processBoardCardDrop(result, originalDragSelection);
      } catch (error) {
        // store.set(isRecordBoardDropProcessingCallbackState, false);
        endRecordDrag();

        throw error;
      }

      // store.set(isRecordBoardDropProcessingCallbackState, false);
      endRecordDrag();
    },
    [
      // processBoardCardDrop,
      endRecordDrag,
      // currentRecordSorts,
      openModal,
      store,
      originalDragSelectionCallbackState,
      // isRecordBoardDropProcessingCallbackState,
    ],
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {children}
    </DragDropContext>
  );
};
