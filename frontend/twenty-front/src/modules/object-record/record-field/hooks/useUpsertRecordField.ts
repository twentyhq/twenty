import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useCallback } from 'react';
import { useStore } from 'jotai';

export const useUpsertRecordField = (recordTableId?: string) => {
  const store = useStore();
  const currentRecordFields = useAtomComponentStateCallbackState(
    currentRecordFieldsComponentState,
    recordTableId,
  );

  const upsertRecordField = useCallback(
    (recordFieldToUpsert: RecordField) => {
      const existingRecordFields = store.get(currentRecordFields);

      const foundRecordFieldInCurrentRecordFields = existingRecordFields.some(
        (existingRecordField) =>
          existingRecordField.id === recordFieldToUpsert.id,
      );

      if (!foundRecordFieldInCurrentRecordFields) {
        store.set(currentRecordFields, [
          ...existingRecordFields,
          recordFieldToUpsert,
        ]);
      } else {
        store.set(currentRecordFields, (previousRecordFields) => {
          const newCurrentRecordFields = [...previousRecordFields];

          const indexOfRecordFieldToUpdate = newCurrentRecordFields.findIndex(
            (existingRecordField) =>
              existingRecordField.id === recordFieldToUpsert.id,
          );

          newCurrentRecordFields[indexOfRecordFieldToUpdate] = {
            ...recordFieldToUpsert,
          };

          return newCurrentRecordFields;
        });
      }
    },
    [currentRecordFields, store],
  );

  return {
    upsertRecordField,
  };
};
