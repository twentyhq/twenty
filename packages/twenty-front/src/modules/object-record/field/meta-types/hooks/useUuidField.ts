import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { isFieldUuid } from '@/object-record/field/types/guards/isFieldUuid';

import { FieldContext } from '../../contexts/FieldContext';
import { useFieldInitialValue } from '../../hooks/useFieldInitialValue';
import { entityFieldsFamilySelector } from '../../states/selectors/entityFieldsFamilySelector';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldTextValue } from '../../types/guards/isFieldTextValue';

export const useUuidField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata('UUID', isFieldUuid, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<string>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: fieldName,
    }),
  );
  const fieldTextValue = isFieldTextValue(fieldValue) ? fieldValue : '';

  const fieldInitialValue = useFieldInitialValue();

  const initialValue = fieldInitialValue?.isEmpty
    ? ''
    : fieldInitialValue?.value ?? fieldTextValue;

  return {
    fieldDefinition,
    fieldValue: fieldTextValue,
    initialValue,
    setFieldValue,
    hotkeyScope,
  };
};
