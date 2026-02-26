import { type DropResult } from '@hello-pangea/dnd';
import { useStore } from 'jotai';
import { useCallback, useContext } from 'react';

import { processGroupDrop } from '@/object-record/record-drag/utils/processGroupDrop';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useUpdateDroppedRecordOnBoard } from '@/object-record/record-drag/hooks/useUpdateDroppedRecordOnBoard';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';

export const useProcessBoardCardDrop = () => {
  const store = useStore();
  const { selectFieldMetadataItem } = useContext(RecordBoardContext);

  const recordIndexRecordIdsByGroupCallbackFamilyState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const { updateDroppedRecordOnBoard } = useUpdateDroppedRecordOnBoard();

  const processBoardCardDrop = useCallback(
    (boardCardDropResult: DropResult, selectedRecordIds: string[]) => {
      if (!selectFieldMetadataItem) return;

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
    },
    [
      store,
      selectFieldMetadataItem,
      recordIndexRecordIdsByGroupCallbackFamilyState,
      updateDroppedRecordOnBoard,
    ],
  );

  return {
    processBoardCardDrop,
  };
};
