import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';

export const useTextFieldDisplay = () => {
  const { recordId, fieldDefinition, displayedMaxRows } =
    useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue =
    useRecordFieldValue<string | undefined>(
      recordId,
      fieldName,
      fieldDefinition,
    ) ?? '';

  return {
    fieldDefinition,
    fieldValue,
    displayedMaxRows,
  };
};
