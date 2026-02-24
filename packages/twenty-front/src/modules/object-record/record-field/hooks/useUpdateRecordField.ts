import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useUpdateRecordField = (
  recordFieldComponentInstanceId?: string,
) => {
  const currentRecordFieldsAtom = useRecoilComponentStateCallbackStateV2(
    currentRecordFieldsComponentState,
    recordFieldComponentInstanceId,
  );

  const updateRecordField = useCallback(
    (
      fieldMetadataItemId: string,
      partialRecordField: Partial<
        Pick<RecordField, 'isVisible' | 'size' | 'position'>
      >,
    ) => {
      const currentRecordFields = jotaiStore.get(currentRecordFieldsAtom);

      const foundRecordFieldInCurrentRecordFields = currentRecordFields.find(
        (existingRecordField) =>
          existingRecordField.fieldMetadataItemId === fieldMetadataItemId,
      );

      if (!isDefined(foundRecordFieldInCurrentRecordFields)) {
        throw new Error(
          `Cannot find record field to update with field metadata item id : ${fieldMetadataItemId}`,
        );
      }

      jotaiStore.set(currentRecordFieldsAtom, (currentRecordFields) => {
        const newCurrentRecordFields = [...currentRecordFields];

        const indexOfRecordFieldToUpdate = newCurrentRecordFields.findIndex(
          (existingRecordField) =>
            existingRecordField.fieldMetadataItemId === fieldMetadataItemId,
        );

        newCurrentRecordFields[indexOfRecordFieldToUpdate] = {
          ...newCurrentRecordFields[indexOfRecordFieldToUpdate],
          ...partialRecordField,
        };

        return newCurrentRecordFields;
      });

      return {
        ...foundRecordFieldInCurrentRecordFields,
        ...partialRecordField,
      } satisfies RecordField as RecordField;
    },
    [currentRecordFieldsAtom],
  );

  return {
    updateRecordField,
  };
};
