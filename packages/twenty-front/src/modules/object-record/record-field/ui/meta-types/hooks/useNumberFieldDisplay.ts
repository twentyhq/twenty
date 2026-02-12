import { useContext } from 'react';

import { FieldMetadataType } from '~/generated-metadata/graphql';

import { useRecordFieldValueV2 } from '@/object-record/record-store/hooks/useRecordFieldValueV2';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldNumber } from '@/object-record/record-field/ui/types/guards/isFieldNumber';

export const useNumberFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.NUMBER, isFieldNumber, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;
  const fieldValue = useRecordFieldValueV2<number | null>(
    recordId,
    fieldName,
    fieldDefinition,
  );

  return {
    fieldDefinition,
    fieldValue,
  };
};
