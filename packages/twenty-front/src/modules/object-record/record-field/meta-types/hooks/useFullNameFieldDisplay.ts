import { useContext } from 'react';

import { FieldFullNameValue } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldContext } from '../../contexts/FieldContext';

export const useFullNameFieldDisplay = () => {
  const { entityId, fieldDefinition } = useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue(entityId, fieldName) as
    | FieldFullNameValue
    | undefined;

  return {
    fieldDefinition,
    fieldValue,
  };
};
