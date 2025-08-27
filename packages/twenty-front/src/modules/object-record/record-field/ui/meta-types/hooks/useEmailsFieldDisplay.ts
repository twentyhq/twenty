import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { type FieldEmailsValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FieldContext } from '../../contexts/FieldContext';

export const useEmailsFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<FieldEmailsValue | undefined>(
    recordId,
    fieldName,
  );

  return {
    fieldDefinition,
    fieldValue,
  };
};
