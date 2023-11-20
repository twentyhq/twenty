import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { isURL } from '~/utils/is-url';

import { FieldContext } from '../../contexts/FieldContext';
import { useFieldInitialValue } from '../../hooks/useFieldInitialValue';
import { usePersistField } from '../../hooks/usePersistField';
import { entityFieldsFamilySelector } from '../../states/selectors/entityFieldsFamilySelector';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldURL } from '../../types/guards/isFieldURL';
import { isFieldURLValue } from '../../types/guards/isFieldURLValue';

export const useURLField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata('URL', isFieldURL, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<string>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: fieldName,
    }),
  );
  const fieldUrlValue = isFieldURLValue(fieldValue) ? fieldValue : '';

  const fieldInitialValue = useFieldInitialValue();

  const initialValue = fieldInitialValue?.isEmpty
    ? ''
    : fieldInitialValue?.value ?? fieldUrlValue;

  const persistField = usePersistField();

  const persistURLField = (newValue: string) => {
    if (!isURL(newValue) && newValue !== '') {
      return;
    }

    persistField(newValue);
  };

  return {
    fieldDefinition,
    fieldValue: fieldUrlValue,
    initialValue,
    setFieldValue,
    hotkeyScope,
    persistURLField,
  };
};
