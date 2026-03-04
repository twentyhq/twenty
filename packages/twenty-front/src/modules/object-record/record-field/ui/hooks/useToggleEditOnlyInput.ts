import { useCallback, useContext } from 'react';
import { useStore } from 'jotai';

import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { isFieldBoolean } from '@/object-record/record-field/ui/types/guards/isFieldBoolean';

export const useToggleEditOnlyInput = () => {
  const store = useStore();
  const {
    recordId,
    fieldDefinition,
    useUpdateRecord = () => [],
  } = useContext(FieldContext);

  const [updateRecord] = useUpdateRecord();

  const toggleField = useCallback(() => {
    const fieldIsBoolean = isFieldBoolean(fieldDefinition);

    if (fieldIsBoolean) {
      const fieldName = fieldDefinition.metadata.fieldName;
      const oldValue = store.get(
        recordStoreFamilySelector.selectorFamily({ recordId, fieldName }),
      ) as boolean;
      const valueToPersist = !oldValue;
      store.set(
        recordStoreFamilySelector.selectorFamily({ recordId, fieldName }),
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
  }, [recordId, fieldDefinition, store, updateRecord]);

  return toggleField;
};
