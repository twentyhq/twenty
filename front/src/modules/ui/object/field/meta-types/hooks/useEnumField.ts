import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldEnumValue } from '@/ui/object/field/types/FieldMetadata';
import { ThemeColor } from '@/ui/theme/constants/colors';

import { FieldContext } from '../../contexts/FieldContext';
import { useFieldInitialValue } from '../../hooks/useFieldInitialValue';
import { entityFieldsFamilySelector } from '../../states/selectors/entityFieldsFamilySelector';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldEnum } from '../../types/guards/isFieldEnum';
import { isFieldEnumValue } from '../../types/guards/isFieldEnumValue';

export const useEnumField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata('ENUM', isFieldEnum, fieldDefinition);

  const { fieldName } = fieldDefinition.metadata;

  const [fieldValue, setFieldValue] = useRecoilState<FieldEnumValue>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: fieldName,
    }),
  );
  const fieldEnumValue = isFieldEnumValue(fieldValue)
    ? fieldValue
    : { color: 'green' as ThemeColor, text: '' };

  const fieldInitialValue = useFieldInitialValue();

  const initialValue = {
    color: 'green' as ThemeColor,
    text: fieldInitialValue?.isEmpty
      ? ''
      : fieldInitialValue?.value ?? fieldEnumValue?.text ?? '',
  };

  return {
    fieldDefinition,
    fieldValue: fieldEnumValue,
    initialValue,
    setFieldValue,
    hotkeyScope,
  };
};
