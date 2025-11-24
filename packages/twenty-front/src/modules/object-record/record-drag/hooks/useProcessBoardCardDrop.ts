import { type DropResult } from '@hello-pangea/dnd';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';

import { processGroupDrop } from '@/object-record/record-drag/utils/processGroupDrop';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';

export const useProcessBoardCardDrop = () => {
  const { updateOneRecord, selectFieldMetadataItem } =
    useContext(RecordBoardContext);

  const recordIndexRecordIdsByGroupFamilyState =
    useRecoilComponentCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const processBoardCardDrop = useRecoilCallback(
    ({ snapshot }) =>
      (boardCardDropResult: DropResult, selectedRecordIds: string[]) => {
        if (!selectFieldMetadataItem) return;

        processGroupDrop({
          groupDropResult: boardCardDropResult,
          snapshot,
          selectedRecordIds,
          recordIdsByGroupFamilyState: recordIndexRecordIdsByGroupFamilyState,
          onUpdateRecord: ({ recordId, position }, targetRecordGroupValue) => {
            updateOneRecord({
              idToUpdate: recordId,
              updateOneRecordInput: {
                [selectFieldMetadataItem.name]: targetRecordGroupValue,
                position,
              },
            });
          },
        });
      },
    [
      updateOneRecord,
      selectFieldMetadataItem,
      recordIndexRecordIdsByGroupFamilyState,
    ],
  );

  return {
    processBoardCardDrop,
  };
};
