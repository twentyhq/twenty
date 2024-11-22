import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { useRecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { FieldContext } from '../../contexts/FieldContext';

export const useTextFieldDisplay = () => {
  const { recordId, fieldDefinition, hotkeyScope, wrap } =
    useContext(FieldContext);
  const inlineCellContext = useRecordInlineCellContext();

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue =
    useRecordFieldValue<string | undefined>(recordId, fieldName) ?? '';

  return {
    fieldDefinition,
    fieldValue,
    hotkeyScope,
    wrap: inlineCellContext.wrap || wrap,
  };
};
