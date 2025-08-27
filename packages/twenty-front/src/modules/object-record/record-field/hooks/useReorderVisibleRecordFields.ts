import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { visibleAndReadableRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleAndReadableRecordFieldsComponentSelector';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { computeNewPositionOfRecordWithPosition } from '@/object-record/utils/computeNewPositionOfRecordWithPosition';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';

export const useReorderVisibleRecordFields = (recordTableId: string) => {
  const visibleRecordFieldsCallbackState = useRecoilComponentCallbackState(
    visibleAndReadableRecordFieldsComponentSelector,
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

        const newPositionOfTargetRecord =
          computeNewPositionOfRecordWithPosition({
            arrayOfRecordsWithPosition: currentRecordFields,
            idOfItemToMove: idOfRecordToMove,
            idOfTargetItem: idOfTargetRecord,
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
