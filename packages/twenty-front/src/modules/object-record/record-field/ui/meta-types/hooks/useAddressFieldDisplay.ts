import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { FieldContext } from '../../contexts/FieldContext';
import { type FieldAddressValue } from '../../types/FieldMetadata';

export const useAddressFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<FieldAddressValue | undefined>(
    recordId,
    fieldName,
    fieldDefinition,
  );

  return {
    fieldDefinition,
    fieldValue,
  };
};
