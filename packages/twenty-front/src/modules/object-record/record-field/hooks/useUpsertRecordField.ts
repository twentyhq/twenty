import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useCallback } from 'react';

export const useUpsertRecordField = (recordTableId?: string) => {
  const currentRecordFieldsAtom = useRecoilComponentStateCallbackStateV2(
    currentRecordFieldsComponentState,
    recordTableId,
  );

  const upsertRecordField = useCallback(
    (recordFieldToUpsert: RecordField) => {
      const currentRecordFields = jotaiStore.get(currentRecordFieldsAtom);

      const foundRecordFieldInCurrentRecordFields = currentRecordFields.some(
        (existingRecordField) =>
          existingRecordField.id === recordFieldToUpsert.id,
      );

      if (!foundRecordFieldInCurrentRecordFields) {
        jotaiStore.set(currentRecordFieldsAtom, [
          ...currentRecordFields,
          recordFieldToUpsert,
        ]);
      } else {
        jotaiStore.set(currentRecordFieldsAtom, (currentRecordFields) => {
          const newCurrentRecordFields = [...currentRecordFields];

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
    [currentRecordFieldsAtom],
  );

  return {
    upsertRecordField,
  };
};
