import { type DropResult } from '@hello-pangea/dnd';
import { useStore } from 'jotai';
import { useCallback, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { processGroupDrop } from '@/object-record/record-drag/utils/processGroupDrop';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { isRecordBoardDropProcessingComponentState } from '@/object-record/record-board/states/isRecordBoardDropProcessingComponentState';
import { useUpdateDroppedRecordOnBoard } from '@/object-record/record-drag/hooks/useUpdateDroppedRecordOnBoard';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useDebouncedCallback } from 'use-debounce';

export const useProcessBoardCardDrop = () => {
  const store = useStore();
  const { selectFieldMetadataItem } = useContext(RecordBoardContext);

  const recordIndexRecordIdsByGroupCallbackFamilyState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const { updateDroppedRecordOnBoard } = useUpdateDroppedRecordOnBoard();

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
    (boardCardDropResult: DropResult, selectedRecordIds: string[]) => {
      if (!isDefined(selectFieldMetadataItem)) return;

      processGroupDrop({
        groupDropResult: boardCardDropResult,
        store,
        selectedRecordIds,
        recordIdsByGroupFamilyState:
          recordIndexRecordIdsByGroupCallbackFamilyState,
        onUpdateRecord: ({ recordId, position }, targetRecordGroupValue) => {
          updateDroppedRecordOnBoard(
            { recordId, position },
            targetRecordGroupValue,
          );
        },
      });

      debouncedUpdateDropProcessing(false);
    },
    [
      store,
      selectFieldMetadataItem,
      recordIndexRecordIdsByGroupCallbackFamilyState,
      updateDroppedRecordOnBoard,
      debouncedUpdateDropProcessing,
    ],
  );

  return {
    processBoardCardDrop,
  };
};
