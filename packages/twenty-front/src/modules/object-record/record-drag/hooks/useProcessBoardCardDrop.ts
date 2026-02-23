import { type DropResult } from '@hello-pangea/dnd';
import { useStore } from 'jotai';
import { useRecoilCallback } from 'recoil';

import { processGroupDrop } from '@/object-record/record-drag/utils/processGroupDrop';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useUpdateDroppedRecordOnBoard } from '@/object-record/record-drag/hooks/useUpdateDroppedRecordOnBoard';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useContext } from 'react';

export const useProcessBoardCardDrop = () => {
  const store = useStore();
  const { selectFieldMetadataItem } = useContext(RecordBoardContext);

  const recordIndexRecordIdsByGroupCallbackFamilyState =
    useRecoilComponentCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const { updateDroppedRecordOnBoard } = useUpdateDroppedRecordOnBoard();

  const processBoardCardDrop = useRecoilCallback(
    ({ snapshot }) =>
      (boardCardDropResult: DropResult, selectedRecordIds: string[]) => {
        if (!selectFieldMetadataItem) return;

        processGroupDrop({
          groupDropResult: boardCardDropResult,
          snapshot,
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
