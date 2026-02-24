import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';
import { useCallback } from 'react';
import { sortByProperty } from '~/utils/array/sortByProperty';

export const useMoveRecordField = (recordTableId?: string) => {
  const currentRecordFieldsAtom = useRecoilComponentStateCallbackStateV2(
    currentRecordFieldsComponentState,
    recordTableId,
  );

  const { saveViewFields } = useSaveCurrentViewFields();

  const { updateRecordField } = useUpdateRecordField(recordTableId);

  const moveRecordField = useCallback(
    async ({
      direction,
      fieldMetadataItemIdToMove,
    }: {
      direction: 'before' | 'after';
      fieldMetadataItemIdToMove: string;
    }) => {
      const currentRecordFields = jotaiStore.get(currentRecordFieldsAtom);

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
    [currentRecordFieldsAtom, saveViewFields, updateRecordField],
  );

  return { moveRecordField };
};
