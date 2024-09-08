import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldDateMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { FieldContext } from '../../contexts/FieldContext';

export const useDateFieldDisplay = () => {
  const { recordId, fieldDefinition, hotkeyScope, clearable } =
    useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<string | undefined>(
    recordId,
    fieldName,
  );

  return {
    fieldDefinition: fieldDefinition as FieldDefinition<FieldDateMetadata>,
    fieldValue,
    hotkeyScope,
    clearable,
  };
};
