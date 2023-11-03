import { useContext } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { FieldContext } from '../../contexts/FieldContext';
import { entityFieldInitialValueFamilyState } from '../../states/entityFieldInitialValueFamilyState';
import { entityFieldsFamilySelector } from '../../states/selectors/entityFieldsFamilySelector';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldText } from '../../types/guards/isFieldText';

export const useTextField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata('text', isFieldText, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<string>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: fieldName,
    }),
  );

  const fieldInitialValue = useRecoilValue(
    entityFieldInitialValueFamilyState({
      entityId,
      fieldId: fieldDefinition.fieldId,
    }),
  );

  const initialValue = fieldInitialValue?.isEmpty
    ? ''
    : fieldInitialValue?.initialValue ?? fieldValue;

  return {
    fieldDefinition,
    fieldValue,
    initialValue,
    setFieldValue,
    hotkeyScope,
  };
};
