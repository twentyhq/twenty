import { useContext } from 'react';

import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';

import { useRecordFieldValueV2 } from '@/object-record/record-store/hooks/useRecordFieldValueV2';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';

export const useFullNameFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValueV2<FieldFullNameValue | undefined>(
    recordId,
    fieldName,
    fieldDefinition,
  );

  return {
    fieldDefinition,
    fieldValue,
  };
};
