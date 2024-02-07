import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';

import { FieldContext } from '../contexts/FieldContext';
import { isFieldBoolean } from '../types/guards/isFieldBoolean';

export const useToggleEditOnlyInput = () => {
  const {
    entityId,
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
            .getLoadable(
              recordStoreFamilySelector({ recordId: entityId, fieldName }),
            )
            .getValue();
          const valueToPersist = !oldValue;
          set(
            recordStoreFamilySelector({ recordId: entityId, fieldName }),
            valueToPersist,
          );

          updateRecord?.({
            variables: {
              where: { id: entityId },
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
    [entityId, fieldDefinition, updateRecord],
  );

  return toggleField;
};
