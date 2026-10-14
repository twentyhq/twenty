import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { getRecordFieldKey } from '@/object-record/record-field/utils/getRecordFieldKey';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

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
      recordFieldKey: string,
      partialRecordField: Partial<
        Pick<RecordField, 'isVisible' | 'size' | 'position'>
      >,
    ) => {
      const existingRecordFields = store.get(currentRecordFields);

      const foundRecordFieldInCurrentRecordFields = existingRecordFields.find(
        (existingRecordField) =>
          getRecordFieldKey(existingRecordField) === recordFieldKey,
      );

      if (!isDefined(foundRecordFieldInCurrentRecordFields)) {
        throw new Error(
          `Cannot find record field to update with key : ${recordFieldKey}`,
        );
      }

      store.set(currentRecordFields, (previousRecordFields) => {
        const newCurrentRecordFields = [...previousRecordFields];

        const indexOfRecordFieldToUpdate = newCurrentRecordFields.findIndex(
          (existingRecordField) =>
            getRecordFieldKey(existingRecordField) === recordFieldKey,
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
    [currentRecordFields, store],
  );

  return {
    updateRecordField,
  };
};
