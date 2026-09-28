import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useStore } from 'jotai';

export const useUpdateRecordField = (
  recordFieldComponentInstanceId?: string,
) => {
  const store = useStore();
  const currentRecordFields = useAtomComponentStateCallbackState(
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
      const existingRecordFields = store.get(currentRecordFields);

      const foundRecordFieldInCurrentRecordFields = existingRecordFields.find(
        (existingRecordField) =>
          existingRecordField.fieldMetadataItemId === fieldMetadataItemId,
      );

      if (!isDefined(foundRecordFieldInCurrentRecordFields)) {
        throw new Error(
          `Cannot find record field to update with field metadata item id : ${fieldMetadataItemId}`,
        );
      }

      store.set(currentRecordFields, (previousRecordFields) =>
        previousRecordFields.map((existingRecordField) =>
          existingRecordField.fieldMetadataItemId === fieldMetadataItemId
            ? { ...existingRecordField, ...partialRecordField }
            : existingRecordField,
        ),
      );

      return {
        ...foundRecordFieldInCurrentRecordFields,
        ...partialRecordField,
      } satisfies RecordField as RecordField;
    },
    [currentRecordFields, store],
  );

  return {
    updateRecordField,
  };
};
