import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldContext } from '../../contexts/FieldContext';

export const useTextFieldDisplay = () => {
  const { recordId, fieldDefinition, hotkeyScope, displayedMaxRows } =
    useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue =
    useRecordFieldValue<string | undefined>(recordId, fieldName) ?? '';

  return {
    fieldDefinition,
    fieldValue,
    hotkeyScope,
    displayedMaxRows,
  };
};
