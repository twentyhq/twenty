import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { type FieldRatingValue } from 'twenty-shared/types';
import { FieldContext } from '../../contexts/FieldContext';

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
