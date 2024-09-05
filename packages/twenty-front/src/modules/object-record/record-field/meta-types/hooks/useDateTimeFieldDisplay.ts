import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldDateTimeMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { FieldContext } from '../../contexts/FieldContext';

export const useDateTimeFieldDisplay = () => {
  const { recordId, fieldDefinition, hotkeyScope, clearable } =
    useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<string | undefined>(
    recordId,
    fieldName,
  );

  return {
    fieldDefinition: fieldDefinition as FieldDefinition<FieldDateTimeMetadata>,
    fieldValue,
    hotkeyScope,
    clearable,
  };
};
