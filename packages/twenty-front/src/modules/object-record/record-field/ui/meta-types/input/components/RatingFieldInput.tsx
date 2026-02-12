import { RatingInput } from '@/ui/field/input/components/RatingInput';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useContext } from 'react';
import { type FieldRatingValue } from 'twenty-shared/types';
import { useRatingField } from '@/object-record/record-field/ui/meta-types/hooks/useRatingField';

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
