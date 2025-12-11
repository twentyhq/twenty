import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { computeNewPositionOfDraggedRecord } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';

export const useReorderVisibleRecordFields = (recordTableId: string) => {
  const visibleRecordFieldsCallbackState = useRecoilComponentCallbackState(
    visibleRecordFieldsComponentSelector,
    recordTableId,
  );

  const currentRecordFieldsCallbackState = useRecoilComponentCallbackState(
    currentRecordFieldsComponentState,
    recordTableId,
  );

  const { updateRecordField } = useUpdateRecordField(recordTableId);

  const reorderVisibleRecordFields = useRecoilCallback(
    ({ snapshot }) =>
      ({ fromIndex, toIndex }: { fromIndex: number; toIndex: number }) => {
        const visibleRecordFields = snapshot
          .getLoadable(visibleRecordFieldsCallbackState)
          .getValue();

        const currentRecordFields = snapshot
          .getLoadable(currentRecordFieldsCallbackState)
          .getValue();

        const idOfRecordToMove = visibleRecordFields[fromIndex].id;
        const idOfTargetRecord = visibleRecordFields[toIndex].id;

        const recordToMove = visibleRecordFields[fromIndex];

        const isDroppedAfterList = toIndex >= visibleRecordFields.length;

        const newPositionOfTargetRecord = computeNewPositionOfDraggedRecord({
          arrayOfRecordsWithPosition: currentRecordFields,
          idOfItemToMove: idOfRecordToMove,
          idOfTargetItem: idOfTargetRecord,
          isDroppedAfterList,
        });

        updateRecordField(recordToMove.fieldMetadataItemId, {
          position: newPositionOfTargetRecord,
        });

        const updatedRecordField: RecordField = {
          ...recordToMove,
          position: newPositionOfTargetRecord,
        };

        return updatedRecordField;
      },
    [
      currentRecordFieldsCallbackState,
      visibleRecordFieldsCallbackState,
      updateRecordField,
    ],
  );

  return { reorderVisibleRecordFields };
};
