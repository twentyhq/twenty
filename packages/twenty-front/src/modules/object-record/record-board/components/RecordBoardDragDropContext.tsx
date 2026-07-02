import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RECORD_BOARD_COLUMN_DND_TYPE } from '@/object-record/record-board/constants/RecordBoardColumnDndType';
import { isRecordBoardDropProcessingComponentState } from '@/object-record/record-board/states/isRecordBoardDropProcessingComponentState';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { useEndRecordDrag } from '@/object-record/record-drag/hooks/useEndRecordDrag';
import { useProcessBoardCardDrop } from '@/object-record/record-drag/hooks/useProcessBoardCardDrop';
import { useStartRecordDrag } from '@/object-record/record-drag/hooks/useStartRecordDrag';
import { originalDragSelectionComponentState } from '@/object-record/record-drag/states/originalDragSelectionComponentState';

import { RECORD_INDEX_REMOVE_SORTING_MODAL_ID } from '@/object-record/record-index/constants/RecordIndexRemoveSortingModalId';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { getBoardCardDropBehavior } from '@/object-record/record-board/utils/getBoardCardDropBehavior';
import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { useReorderRecordGroups } from '@/object-record/record-group/hooks/useReorderRecordGroups';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { ViewType } from '@/views/types/ViewType';
import {
  DragDropContext,
  type DragStart,
  type OnDragEndResponder,
} from '@hello-pangea/dnd';
import { useStore } from 'jotai';
import { useCallback, useContext } from 'react';

export const RecordBoardDragDropContext = ({
  children,
}: React.PropsWithChildren) => {
  const { recordBoardId } = useContext(RecordBoardContext);

  const { reorderRecordGroups } = useReorderRecordGroups({
    recordIndexId: recordBoardId,
    viewType: ViewType.KANBAN,
  });

  const currentRecordSorts = useAtomComponentStateCallbackState(
    currentRecordSortsComponentState,
    recordBoardId,
  );

  const recordIndexRecordGroupSort = useAtomComponentStateCallbackState(
    recordIndexRecordGroupSortComponentState,
    recordBoardId,
  );

  const recordBoardSelectedRecordIds = useAtomComponentSelectorCallbackState(
    recordBoardSelectedRecordIdsComponentSelector,
    recordBoardId,
  );

  const store = useStore();

  const originalDragSelectionCallbackState = useAtomComponentStateCallbackState(
    originalDragSelectionComponentState,
    recordBoardId,
  );

  const { startRecordDrag } = useStartRecordDrag(recordBoardId);
  const { endRecordDrag } = useEndRecordDrag(recordBoardId);

  const { processBoardCardDrop } = useProcessBoardCardDrop();

  const isRecordBoardDropProcessingCallbackState =
    useAtomComponentStateCallbackState(
      isRecordBoardDropProcessingComponentState,
    );

  const { openModal } = useModal();

  const handleDragStart = useCallback(
    (start: DragStart) => {
      if (start.type === RECORD_BOARD_COLUMN_DND_TYPE) {
        return;
      }

      const currentSelectedRecordIds = store.get(recordBoardSelectedRecordIds);

      store.set(isRecordBoardDropProcessingCallbackState, true);

      startRecordDrag(start, currentSelectedRecordIds);
    },
    [
      recordBoardSelectedRecordIds,
      startRecordDrag,
      store,
      isRecordBoardDropProcessingCallbackState,
    ],
  );

  const handleDragEnd: OnDragEndResponder = useCallback(
    (result) => {
      if (result.type === RECORD_BOARD_COLUMN_DND_TYPE) {
        if (!result.destination) {
          return;
        }

        reorderRecordGroups({
          fromIndex: result.source.index,
          toIndex: result.destination.index,
        });

        store.set(recordIndexRecordGroupSort, RecordGroupSort.Manual);

        return;
      }

      const originalDragSelection = store.get(
        originalDragSelectionCallbackState,
      );

      if (!result.destination) {
        store.set(isRecordBoardDropProcessingCallbackState, false);
        endRecordDrag();
        return;
      }

      const existingRecordSorts = store.get(currentRecordSorts);
      const boardCardDropBehavior = getBoardCardDropBehavior({
        hasRecordSorts: existingRecordSorts.length > 0,
        sourceDroppableId: result.source.droppableId,
        destinationDroppableId: result.destination.droppableId,
      });

      if (boardCardDropBehavior.shouldBlockDrop) {
        store.set(isRecordBoardDropProcessingCallbackState, false);
        endRecordDrag();
        openModal(RECORD_INDEX_REMOVE_SORTING_MODAL_ID);
        return;
      }

      try {
        processBoardCardDrop(result, originalDragSelection, {
          shouldUpdatePosition: boardCardDropBehavior.shouldUpdatePosition,
        });
      } catch (error) {
        store.set(isRecordBoardDropProcessingCallbackState, false);
        endRecordDrag();

        throw error;
      }

      store.set(isRecordBoardDropProcessingCallbackState, false);
      endRecordDrag();
    },
    [
      processBoardCardDrop,
      endRecordDrag,
      currentRecordSorts,
      openModal,
      store,
      originalDragSelectionCallbackState,
      isRecordBoardDropProcessingCallbackState,
      recordIndexRecordGroupSort,
      reorderRecordGroups,
    ],
  );

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
    </DragDropContext>
  );
};
