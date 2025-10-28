import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
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

  // TODO: fix this we want to move left and right of VISIBLE record fields,
  // because otherwise it will just do nothing while moving left and right of non visible record fields
  const moveRecordField = useRecoilCallback(
    ({ snapshot }) =>
      async ({
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

          await saveViewFields([
            mapRecordFieldToViewField({
              ...targetRecordField,
              position: targetRecordFieldNewPosition,
            }),
            mapRecordFieldToViewField({
              ...currentRecordField,
              position: currentRecordFieldNewPosition,
            }),
          ]);
        }
      },
    [currentRecordFieldsCallbackState, saveViewFields, updateRecordField],
  );

  return { moveRecordField };
};
