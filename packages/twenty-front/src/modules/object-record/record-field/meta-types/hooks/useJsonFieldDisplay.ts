import { useContext } from 'react';

import { FieldJsonValue } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldContext } from '../../contexts/FieldContext';

export const useJsonFieldDisplay = () => {
  const { recordId, fieldDefinition, maxWidth } = useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<FieldJsonValue | undefined>(
    recordId,
    fieldName,
  );

  return {
    maxWidth,
    fieldDefinition,
    fieldValue,
  };
};
