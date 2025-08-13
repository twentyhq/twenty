import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldDateTimeMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FieldContext } from '../../contexts/FieldContext';

export const useDateTimeFieldDisplay = () => {
  const { recordId, fieldDefinition, clearable } = useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<string | undefined>(
    recordId,
    fieldName,
  );

  return {
    fieldDefinition: fieldDefinition as FieldDefinition<FieldDateTimeMetadata>,
    fieldValue,
    clearable,
  };
};
