import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';

export const useUpsertRecordField = (recordTableId?: string) => {
  const currentRecordFieldsCallbackState = useRecoilComponentCallbackState(
    currentRecordFieldsComponentState,
    recordTableId,
  );

  const upsertRecordField = useRecoilCallback(
    ({ set, snapshot }) =>
      (recordFieldToUpsert: RecordField) => {
        const currentRecordFields = getSnapshotValue(
          snapshot,
          currentRecordFieldsCallbackState,
        );

        const foundRecordFieldInCurrentRecordFields = currentRecordFields.some(
          (existingRecordField) =>
            existingRecordField.id === recordFieldToUpsert.id,
        );

        if (!foundRecordFieldInCurrentRecordFields) {
          set(currentRecordFieldsCallbackState, [
            ...currentRecordFields,
            recordFieldToUpsert,
          ]);
        } else {
          set(currentRecordFieldsCallbackState, (currentRecordFields) => {
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
    [currentRecordFieldsCallbackState],
  );

  return {
    upsertRecordField,
  };
};
