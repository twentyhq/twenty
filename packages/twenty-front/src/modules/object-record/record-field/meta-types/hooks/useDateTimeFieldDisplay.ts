import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';

import { FieldContext } from '../../contexts/FieldContext';

export const useDateTimeFieldDisplay = () => {
  const { dateTimeFormat } = useContext(RecordTableContext);
  const { entityId, fieldDefinition, hotkeyScope, clearable } =
    useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<string | undefined>(
    entityId,
    fieldName,
  );

  return {
    ...dateTimeFormat,
    fieldDefinition,
    fieldValue,
    hotkeyScope,
    clearable,
  };
};
