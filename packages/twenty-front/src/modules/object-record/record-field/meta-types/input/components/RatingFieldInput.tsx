import { type FieldRatingValue } from '@/object-record/record-field/types/FieldMetadata';
import { RatingInput } from '@/ui/field/input/components/RatingInput';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldInputEventContext } from '@/object-record/record-field/contexts/FieldInputEventContext';
import { useContext } from 'react';
import { useRatingField } from '../../hooks/useRatingField';

export const RatingFieldInput = () => {
  const { rating } = useRatingField();

  const { isRecordFieldReadOnly } = useContext(FieldContext);

  const { onSubmit } = useContext(FieldInputEventContext);

  const handleChange = (newRating: FieldRatingValue) => {
    onSubmit?.({ newValue: newRating });
  };

  return (
    <RatingInput
      value={rating}
      onChange={handleChange}
      readonly={isRecordFieldReadOnly}
    />
  );
};
