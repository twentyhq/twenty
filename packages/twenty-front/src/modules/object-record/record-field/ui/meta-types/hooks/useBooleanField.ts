import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldBoolean } from '../../types/guards/isFieldBoolean';

export const useBooleanField = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.BOOLEAN,
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
  };
};
