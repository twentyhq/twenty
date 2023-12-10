import { useContext } from 'react';
import { isPossiblePhoneNumber } from 'libphonenumber-js';
import { useRecoilState } from 'recoil';

import { FieldContext } from '../../contexts/FieldContext';
import { useFieldInitialValue } from '../../hooks/useFieldInitialValue';
import { usePersistField } from '../../hooks/usePersistField';
import { entityFieldsFamilySelector } from '../../states/selectors/entityFieldsFamilySelector';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldPhone } from '../../types/guards/isFieldPhone';

export const usePhoneField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  //assertFieldMetadata('PHONE', isFieldPhone, fieldDefinition);
  assertFieldMetadata('TEXT', isFieldPhone, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<string>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: fieldName,
    }),
  );

  const persistField = usePersistField();

  const persistPhoneField = (newPhoneValue: string) => {
    if (!isPossiblePhoneNumber(newPhoneValue) && newPhoneValue !== '') return;

    persistField(newPhoneValue);
  };

  const fieldInitialValue = useFieldInitialValue();

  const initialValue = fieldInitialValue?.isEmpty
    ? ''
    : fieldInitialValue?.value ?? fieldValue;

  return {
    fieldDefinition,
    fieldValue,
    initialValue,
    setFieldValue,
    hotkeyScope,
    persistPhoneField,
  };
};
