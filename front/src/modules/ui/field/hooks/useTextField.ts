import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { genericEntityFieldFamilySelector } from '@/ui/editable-field/states/selectors/genericEntityFieldFamilySelector';

import { FieldContext } from '../contexts/FieldContext';
import { fieldValueForPersistFamilyState } from '../states/fieldValueForPersistFamilyState';
import { assertFieldMetadata } from '../types/guards/assertFieldMetadata';
import { isFieldText } from '../types/guards/isFieldText';

export const useTextField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata('text', isFieldText, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<string>(
    genericEntityFieldFamilySelector({
      entityId: entityId,
      fieldName: fieldName,
    }),
  );

  const [fieldValueForPersist, setFieldValueForPersist] =
    useRecoilState<string>(
      fieldValueForPersistFamilyState({
        entityId: entityId,
        fieldName: fieldName,
      }),
    );

  return {
    fieldDefinition,
    fieldValue,
    setFieldValue,
    fieldValueForPersist,
    setFieldValueForPersist,
    hotkeyScope,
  };
};
