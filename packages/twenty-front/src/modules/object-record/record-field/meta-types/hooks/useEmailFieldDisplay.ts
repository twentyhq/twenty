import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldContext } from '../../contexts/FieldContext';

export const useEmailFieldDisplay = () => {
  const { recordId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<string>(recordId, fieldName);

  return {
    fieldDefinition,
    fieldValue,
    hotkeyScope,
  };
};
