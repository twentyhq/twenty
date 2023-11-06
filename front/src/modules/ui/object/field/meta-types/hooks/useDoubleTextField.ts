import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '../../contexts/FieldContext';
import { useFieldInitialValue } from '../../hooks/useFieldInitialValue';
import { entityFieldsFamilySelector } from '../../states/selectors/entityFieldsFamilySelector';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldDoubleText } from '../../types/guards/isFieldDoubleText';

export const useDoubleTextField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata('DOUBLE_TEXT', isFieldDoubleText, fieldDefinition);

  const [firstValue, setFirstValue] = useRecoilState<string>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: fieldDefinition.metadata.firstValueFieldName,
    }),
  );

  const [secondValue, setSecondValue] = useRecoilState<string>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: fieldDefinition.metadata.secondValueFieldName,
    }),
  );

  const fieldInitialValue = useFieldInitialValue();

  const initialFirstValue = fieldInitialValue?.isEmpty
    ? ''
    : fieldInitialValue?.value ?? firstValue;

  const initialSecondValue = fieldInitialValue?.isEmpty
    ? ''
    : fieldInitialValue?.value
    ? ''
    : secondValue;

  const fullValue = [firstValue, secondValue].filter(Boolean).join(' ');

  return {
    fieldDefinition,
    secondValue,
    setSecondValue,
    firstValue,
    initialFirstValue,
    initialSecondValue,
    setFirstValue,
    fullValue,
    hotkeyScope,
  };
};
