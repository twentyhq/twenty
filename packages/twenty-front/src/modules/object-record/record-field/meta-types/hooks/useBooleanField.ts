import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldBoolean } from '../../types/guards/isFieldBoolean';

export const useBooleanField = () => {
  const { recordId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.Boolean,
    isFieldBoolean,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<boolean>(
    recordStoreFamilySelector({
      recordId,
      fieldName: fieldName,
    }),
  );

  return {
    fieldDefinition,
    fieldValue,
    setFieldValue,
    hotkeyScope,
  };
};
