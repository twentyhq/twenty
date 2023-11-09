import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '../../contexts/FieldContext';
import { useFieldInitialValue } from '../../hooks/useFieldInitialValue';
import { usePersistField } from '../../hooks/usePersistField';
import { entityFieldsFamilySelector } from '../../states/selectors/entityFieldsFamilySelector';
import { FieldURLV2Value } from '../../types/FieldMetadata';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldURLV2 } from '../../types/guards/isFieldURLV2';
import { isFieldURLV2Value } from '../../types/guards/isFieldURLV2Value';

export const useURLV2Field = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata('URL_V2', isFieldURLV2, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldURLV2Value>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: fieldName,
    }),
  );

  const fieldInitialValue = useFieldInitialValue();

  const initialValue: FieldURLV2Value = fieldInitialValue?.isEmpty
    ? { link: '', text: '' }
    : fieldInitialValue?.value
    ? { link: fieldInitialValue.value, text: '' }
    : fieldValue;

  const persistField = usePersistField();

  const persistURLField = (newValue: FieldURLV2Value) => {
    if (!isFieldURLV2Value(newValue)) {
      return;
    }

    persistField(newValue);
  };

  return {
    fieldDefinition,
    fieldValue,
    initialValue,
    setFieldValue,
    hotkeyScope,
    persistURLField,
  };
};
