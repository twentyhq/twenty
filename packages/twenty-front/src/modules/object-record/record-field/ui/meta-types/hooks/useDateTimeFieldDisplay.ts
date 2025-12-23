import { useContext } from 'react';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldDateTimeMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';

export const useDateTimeFieldDisplay = () => {
  const { recordId, fieldDefinition, clearable } = useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<string | undefined>(
    recordId,
    fieldName,
    fieldDefinition,
  );

  return {
    fieldDefinition: fieldDefinition as FieldDefinition<FieldDateTimeMetadata>,
    fieldValue,
    clearable,
  };
};
