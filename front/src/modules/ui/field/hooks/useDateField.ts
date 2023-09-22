import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '../contexts/FieldContext';
import { fieldValueForPersistFamilyState } from '../states/fieldValueForPersistFamilyState';
import { entityFieldsFamilySelector } from '../states/selectors/entityFieldsFamilySelector';
import { assertFieldMetadata } from '../types/guards/assertFieldMetadata';
import { isFieldDate } from '../types/guards/isFieldDate';

export const useDateField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata('date', isFieldDate, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<string>(
    entityFieldsFamilySelector({
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
