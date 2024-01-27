import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';

import { FieldContext } from '../../contexts/FieldContext';
import { useFieldInitialValue } from '../../hooks/useFieldInitialValue';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldText } from '../../types/guards/isFieldText';
import { isFieldTextValue } from '../../types/guards/isFieldTextValue';

export const useTextField = () => {
  const { entityId, fieldDefinition, hotkeyScope, maxWidth } =
    useContext(FieldContext);

  assertFieldMetadata('TEXT', isFieldText, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<string>(
    recordStoreFamilySelector({
      recordId: entityId,
      fieldName: fieldName,
    }),
  );
  const fieldTextValue = isFieldTextValue(fieldValue) ? fieldValue : '';

  const fieldInitialValue = useFieldInitialValue();

  const initialValue = fieldInitialValue?.isEmpty
    ? ''
    : fieldInitialValue?.value ?? fieldTextValue;

  return {
    maxWidth,
    fieldDefinition,
    fieldValue: fieldTextValue,
    initialValue,
    setFieldValue,
    hotkeyScope,
  };
};
