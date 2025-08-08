import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { DropResult } from '@hello-pangea/dnd';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { getDragOperationType } from '../utils/getDragOperationType';
import { processMultiDrag } from '../utils/processMultiDrag';
import { processSingleDrag } from '../utils/processSingleDrag';

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
        if (!result.destination || !selectFieldMetadataItem) return;

        const draggedRecordId = result.draggableId;
        const destinationGroupId = result.destination.droppableId;

        const recordGroup = getSnapshotValue(
          snapshot,
          recordGroupDefinitionFamilyState(destinationGroupId),
        );

        if (!recordGroup) return;

        const destinationRecordIds = getSnapshotValue(
          snapshot,
          recordIndexRecordIdsByGroupFamilyState(destinationGroupId),
        ) as string[];

        const recordPositionData = destinationRecordIds.map((recordId) => {
          const record = getSnapshotValue(
            snapshot,
            recordStoreFamilyState(recordId),
          );
          return {
            recordId,
            position: record?.position,
          };
        });

        const operationType = getDragOperationType({
          draggedRecordId,
          selectedRecordIds,
        });

        if (operationType === 'single') {
          const singleDragResult = processSingleDrag({
            result,
            recordPositionData,
            destinationRecordIds,
            groupValue: recordGroup.value,
            selectFieldName: selectFieldMetadataItem.name,
          });

          updateOneRecord({
            idToUpdate: singleDragResult.recordId,
            updateOneRecordInput: {
              [selectFieldMetadataItem.name]: singleDragResult.groupValue,
              position: singleDragResult.position,
            },
          });
        } else {
          const multiDragResult = processMultiDrag({
            result,
            selectedRecordIds,
            recordPositionData,
            destinationRecordIds,
            groupValue: recordGroup.value,
            selectFieldName: selectFieldMetadataItem.name,
          });

          for (const update of multiDragResult.recordUpdates) {
            updateOneRecord({
              idToUpdate: update.recordId,
              updateOneRecordInput: {
                [selectFieldMetadataItem.name]: update.groupValue,
                position: update.position,
              },
            });
          }
        }
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
