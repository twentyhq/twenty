import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { useUpdateTableColumn } from '@/object-record/record-field/hooks/useUpdateTableColumn';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';
import { useRecoilCallback } from 'recoil';
import { sortByProperty } from '~/utils/array/sortByProperty';

export const useMoveRecordField = (recordTableId?: string) => {
  const currentRecordFieldsCallbackState = useRecoilComponentCallbackState(
    currentRecordFieldsComponentState,
    recordTableId,
  );

  const { saveViewFields } = useSaveCurrentViewFields();

  const { updateRecordField } = useUpdateRecordField(recordTableId);

  const { updateTableColumn } = useUpdateTableColumn(recordTableId);

  const moveRecordField = useRecoilCallback(
    ({ snapshot }) =>
      ({
        direction,
        fieldMetadataItemIdToMove,
      }: {
        direction: 'before' | 'after';
        fieldMetadataItemIdToMove: string;
      }) => {
        const currentRecordFields = snapshot
          .getLoadable(currentRecordFieldsCallbackState)
          .getValue();

        const sortedRecordFields = currentRecordFields.toSorted(
          sortByProperty('position'),
        );

        const indexOfRecordFieldToMove = sortedRecordFields.findIndex(
          (recordField) =>
            recordField.fieldMetadataItemId === fieldMetadataItemIdToMove,
        );

        if (indexOfRecordFieldToMove === -1) {
          return;
        }

        const newRecordFields = [...sortedRecordFields];

        const targetArrayIndex =
          direction === 'before'
            ? indexOfRecordFieldToMove - 1
            : indexOfRecordFieldToMove + 1;

        const targetArraySize = newRecordFields.length - 1;

        if (
          indexOfRecordFieldToMove >= 0 &&
          targetArrayIndex >= 0 &&
          indexOfRecordFieldToMove <= targetArraySize &&
          targetArrayIndex <= targetArraySize
        ) {
          const currentRecordField = newRecordFields[indexOfRecordFieldToMove];
          const targetRecordField = newRecordFields[targetArrayIndex];

          const targetRecordFieldNewPosition = currentRecordField.position;
          const currentRecordFieldNewPosition = targetRecordField.position;

          updateRecordField(targetRecordField.fieldMetadataItemId, {
            position: targetRecordFieldNewPosition,
          });

          updateRecordField(currentRecordField.fieldMetadataItemId, {
            position: currentRecordFieldNewPosition,
          });

          saveViewFields([
            mapRecordFieldToViewField({
              ...targetRecordField,
              position: targetRecordFieldNewPosition,
            }),
            mapRecordFieldToViewField({
              ...currentRecordField,
              position: currentRecordFieldNewPosition,
            }),
          ]);

          updateTableColumn(targetRecordField.fieldMetadataItemId, {
            position: targetRecordFieldNewPosition,
          });

          updateTableColumn(currentRecordField.fieldMetadataItemId, {
            position: currentRecordFieldNewPosition,
          });
        }
      },
    [
      currentRecordFieldsCallbackState,
      updateTableColumn,
      saveViewFields,
      updateRecordField,
    ],
  );

  return { moveRecordField };
};
