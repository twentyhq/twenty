import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldEmailsValue } from '@/object-record/record-field/types/FieldMetadata';
import { FieldContext } from '../../contexts/FieldContext';

export const useEmailsFieldDisplay = () => {
  const { recordId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<FieldEmailsValue | undefined>(
    recordId,
    fieldName,
  );

  return {
    fieldDefinition,
    fieldValue,
    hotkeyScope,
  };
};
