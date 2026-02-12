import { useContext } from 'react';

import { useRecordFieldValueV2 } from '@/object-record/record-store/hooks/useRecordFieldValueV2';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';

export const useTextFieldDisplay = () => {
  const { recordId, fieldDefinition, displayedMaxRows } =
    useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue =
    useRecordFieldValueV2<string | undefined>(
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
