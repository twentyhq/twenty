import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useUpdateRecordField = (
  recordFieldComponentInstanceId?: string,
) => {
  const currentRecordFieldsCallbackState = useRecoilComponentCallbackState(
    currentRecordFieldsComponentState,
    recordFieldComponentInstanceId,
  );

  const updateRecordField = useRecoilCallback(
    ({ set, snapshot }) =>
      (
        fieldMetadataItemId: string,
        partialRecordField: Partial<
          Pick<RecordField, 'isVisible' | 'size' | 'position'>
        >,
      ) => {
        const currentRecordFields = getSnapshotValue(
          snapshot,
          currentRecordFieldsCallbackState,
        );

        const foundRecordFieldInCurrentRecordFields = currentRecordFields.find(
          (existingRecordField) =>
            existingRecordField.fieldMetadataItemId === fieldMetadataItemId,
        );

        if (!isDefined(foundRecordFieldInCurrentRecordFields)) {
          throw new Error(
            `Cannot find record field to update with field metadata item id : ${fieldMetadataItemId}`,
          );
        } else {
          set(currentRecordFieldsCallbackState, (currentRecordFields) => {
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
        }
      },
    [currentRecordFieldsCallbackState],
  );

  return {
    updateRecordField,
  };
};
