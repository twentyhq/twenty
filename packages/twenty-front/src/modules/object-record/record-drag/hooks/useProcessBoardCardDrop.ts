import { useStore } from 'jotai';
import { useCallback, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { isRecordBoardDropProcessingComponentState } from '@/object-record/record-board/states/isRecordBoardDropProcessingComponentState';
import { useUpdateDroppedRecordOnBoard } from '@/object-record/record-drag/hooks/useUpdateDroppedRecordOnBoard';
import { draggedRecordIdsComponentState } from '@/object-record/record-drag/states/draggedRecordIdsComponentState';
import { type RecordDragDropResult } from '@/object-record/record-drag/types/RecordDragDropResult';
import { computeDroppedRecordPositions } from '@/object-record/record-drag/utils/computeDroppedRecordPositions';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { getRecordIndexRemoveSortingModalId } from '@/object-record/record-index/utils/getRecordIndexRemoveSortingModalId';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useProcessBoardCardDrop = () => {
  const store = useStore();
  const { selectFieldMetadataItem } = useContext(RecordBoardContext);
  const { recordIndexId } = useRecordIndexContextOrThrow();
  const { openDialog } = useDialog();
  const { updateDroppedRecordOnBoard } = useUpdateDroppedRecordOnBoard();

  const recordIdsByGroupCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );
  const draggedRecordIdsCallbackState = useAtomComponentStateCallbackState(
    draggedRecordIdsComponentState,
  );
  const currentRecordSortsCallbackState = useAtomComponentStateCallbackState(
    currentRecordSortsComponentState,
  );
  const isRecordBoardDropProcessingCallbackState =
    useAtomComponentStateCallbackState(
      isRecordBoardDropProcessingComponentState,
    );

  // TODO: this is necessary to avoid race conditions when dragging right after a previous drag (~200ms to 500ms)
  // A way to fix this would be to have a proper optimistic logic on drop that doesn't just resets the whole board with trigger initial query but updates everything without waiting for the request return
  // Which is the problem here because it kind of destroys the existing columns that have more records than page size, and dnd library has issues computing drag when the underlying data change.
  const debouncedUpdateDropProcessing = useDebouncedCallback(
    (isPending: boolean) => {
      store.set(isRecordBoardDropProcessingCallbackState, isPending);
    },
    500,
  );

  const processBoardCardDrop = useCallback(
    ({
      draggedRecordId,
      sourceDroppableId,
      destinationDroppableId,
      destinationIndex,
    }: RecordDragDropResult) => {
      if (!isDefined(selectFieldMetadataItem)) {
        return;
      }

      const hasRecordSorts =
        store.get(currentRecordSortsCallbackState).length > 0;

      // A sorted board can still move a card to another column, only not
      // reorder it within one
      if (hasRecordSorts && sourceDroppableId === destinationDroppableId) {
        openDialog(getRecordIndexRemoveSortingModalId(recordIndexId));
        return;
      }

      const destinationRecordGroup = store.get(
        recordGroupDefinitionFamilyState.atomFamily(destinationDroppableId),
      );

      if (!isDefined(destinationRecordGroup)) {
        throw new Error('Record group is not defined');
      }

      store.set(isRecordBoardDropProcessingCallbackState, true);

      try {
        const updatedRecords = computeDroppedRecordPositions({
          destinationRecordIds: store.get(
            recordIdsByGroupCallbackState(destinationDroppableId),
          ),
          destinationIndex,
          draggedRecordId,
          draggedRecordIds: store.get(draggedRecordIdsCallbackState),
          store,
        });

        for (const { id, position } of updatedRecords) {
          updateDroppedRecordOnBoard(
            { recordId: id, position: hasRecordSorts ? undefined : position },
            destinationRecordGroup.value,
          );
        }
      } finally {
        debouncedUpdateDropProcessing(false);
      }
    },
    [
      store,
      selectFieldMetadataItem,
      recordIndexId,
      openDialog,
      updateDroppedRecordOnBoard,
      debouncedUpdateDropProcessing,
      recordIdsByGroupCallbackState,
      draggedRecordIdsCallbackState,
      currentRecordSortsCallbackState,
      isRecordBoardDropProcessingCallbackState,
    ],
  );

  return { processBoardCardDrop };
};
