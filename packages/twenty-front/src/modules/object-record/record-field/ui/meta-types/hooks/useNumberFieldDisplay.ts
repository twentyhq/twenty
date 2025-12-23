import { useContext } from 'react';

import { FieldMetadataType } from '~/generated-metadata/graphql';

import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldNumber } from '@/object-record/record-field/ui/types/guards/isFieldNumber';

export const useNumberFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.NUMBER, isFieldNumber, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;
  const fieldValue = useRecordFieldValue<number | null>(
    recordId,
    fieldName,
    fieldDefinition,
  );

  return {
    fieldDefinition,
    fieldValue,
  };
};
