import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldNumber } from '../../types/guards/isFieldNumber';

export const useNumberFieldDisplay = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.Number, isFieldNumber, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;
  const fieldValue = useRecordFieldValue(entityId, fieldName) as number | null;

  return {
    fieldDefinition,
    fieldValue,
    hotkeyScope,
  };
};
