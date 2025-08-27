import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { type FieldRatingValue } from '@/object-record/record-field/ui/types/FieldRatingValue';

export const useRatingFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<FieldRatingValue>(recordId, fieldName);

  const rating = fieldValue ?? null;

  return {
    fieldDefinition,
    rating,
  };
};
