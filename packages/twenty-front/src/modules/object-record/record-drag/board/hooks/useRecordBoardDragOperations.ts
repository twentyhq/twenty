import { type DropResult } from '@hello-pangea/dnd';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { processGroupDragOperation } from '@/object-record/record-drag/shared/utils/processGroupDragOperation';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';

export const useRecordBoardDragOperations = () => {
  const { updateOneRecord, selectFieldMetadataItem } =
    useContext(RecordBoardContext);

  const recordIndexRecordIdsByGroupFamilyState =
    useRecoilComponentCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const processDragOperation = useRecoilCallback(
    ({ snapshot }) =>
      (result: DropResult, selectedRecordIds: string[]) => {
        if (!selectFieldMetadataItem) return;

        processGroupDragOperation({
          result,
          snapshot,
          selectedRecordIds,
          selectFieldName: selectFieldMetadataItem.name,
          recordIdsByGroupFamilyState: recordIndexRecordIdsByGroupFamilyState,
          onUpdateRecord: ({ recordId, position, groupValue }) => {
            updateOneRecord({
              idToUpdate: recordId,
              updateOneRecordInput: {
                [selectFieldMetadataItem.name]: groupValue,
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
    processDragOperation,
  };
};
