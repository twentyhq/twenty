import { useContext } from 'react';

import { FieldRatingValue } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldContext } from '../../contexts/FieldContext';

export const useRatingFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue(recordId, fieldName) as
    | FieldRatingValue
    | undefined;

  const rating = fieldValue ?? 'RATING_1';

  return {
    fieldDefinition,
    rating,
  };
};
