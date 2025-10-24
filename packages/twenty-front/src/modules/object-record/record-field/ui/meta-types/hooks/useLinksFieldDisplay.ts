import { useContext } from 'react';

import { type FieldLinksValue } from '@/object-record/record-field/ui/types/FieldMetadata';

import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { FieldContext } from '../../contexts/FieldContext';

export const useLinksFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<FieldLinksValue | undefined>(
    recordId,
    fieldName,
    fieldDefinition,
  );

  return {
    fieldDefinition,
    fieldValue,
  };
};
