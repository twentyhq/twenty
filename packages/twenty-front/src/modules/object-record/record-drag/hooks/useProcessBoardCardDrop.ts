import { type DropResult } from '@hello-pangea/dnd';
import { useRecoilCallback } from 'recoil';

import { processGroupDrop } from '@/object-record/record-drag/utils/processGroupDrop';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useUpdateDroppedRecordOnBoard } from '@/object-record/record-drag/hooks/useUpdateDroppedRecordOnBoard';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useContext } from 'react';

export const useProcessBoardCardDrop = () => {
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
      selectFieldMetadataItem,
      recordIndexRecordIdsByGroupCallbackFamilyState,
      updateDroppedRecordOnBoard,
    ],
  );

  return {
    processBoardCardDrop,
  };
};
