import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { isFieldBoolean } from '@/object-record/record-field/ui/types/guards/isFieldBoolean';

export const useToggleEditOnlyInput = () => {
  const {
    recordId,
    fieldDefinition,
    useUpdateRecord = () => [],
  } = useContext(FieldContext);

  const [updateRecord] = useUpdateRecord();

  const toggleField = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const fieldIsBoolean = isFieldBoolean(fieldDefinition);

        if (fieldIsBoolean) {
          const fieldName = fieldDefinition.metadata.fieldName;
          const oldValue = snapshot
            .getLoadable(recordStoreFamilySelector({ recordId, fieldName }))
            .getValue();
          const valueToPersist = !oldValue;
          set(
            recordStoreFamilySelector({ recordId, fieldName }),
            valueToPersist,
          );

          updateRecord?.({
            variables: {
              where: { id: recordId },
              updateOneRecordInput: {
                [fieldName]: valueToPersist,
              },
            },
          });
        } else {
          throw new Error(
            `Invalid value to toggle for type : ${fieldDefinition}, type may not be implemented in useToggleEditOnlyInput.`,
          );
        }
      },
    [recordId, fieldDefinition, updateRecord],
  );

  return toggleField;
};
