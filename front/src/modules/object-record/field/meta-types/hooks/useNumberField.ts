import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import {
  canBeCastAsIntegerOrNull,
  castAsIntegerOrNull,
} from '~/utils/cast-as-integer-or-null';

import { FieldContext } from '../../contexts/FieldContext';
import { useFieldInitialValue } from '../../hooks/useFieldInitialValue';
import { usePersistField } from '../../hooks/usePersistField';
import { entityFieldsFamilySelector } from '../../states/selectors/entityFieldsFamilySelector';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldNumber } from '../../types/guards/isFieldNumber';

export const useNumberField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata('NUMBER', isFieldNumber, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<number | null>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: fieldName,
    }),
  );

  const persistField = usePersistField();

  const persistNumberField = (newValue: string) => {
    if (!canBeCastAsIntegerOrNull(newValue)) {
      return;
    }

    const castedValue = castAsIntegerOrNull(newValue);

    persistField(castedValue);
  };

  const fieldInitialValue = useFieldInitialValue();

  const initialValue = fieldInitialValue?.isEmpty
    ? null
    : !isNaN(Number(fieldInitialValue?.value))
      ? Number(fieldInitialValue?.value)
      : null ?? fieldValue;

  return {
    fieldDefinition,
    fieldValue,
    initialValue,
    setFieldValue,
    hotkeyScope,
    persistNumberField,
  };
};
