import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { type FieldRatingValue } from 'twenty-shared/types';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';

export const useRatingFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<FieldRatingValue>(
    recordId,
    fieldName,
    fieldDefinition,
  );

  const rating = fieldValue ?? null;

  return {
    fieldDefinition,
    rating,
  };
};
