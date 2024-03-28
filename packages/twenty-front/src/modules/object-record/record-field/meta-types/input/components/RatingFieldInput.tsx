import { RatingInput } from 'twenty-ui';

import { RatingValue } from '@/object-record/record-field/meta-types/constants/RatingValues';

import { usePersistField } from '../../../hooks/usePersistField';
import { useRatingField } from '../../hooks/useRatingField';

import { FieldInputEvent } from './DateFieldInput';

export type RatingFieldInputProps = {
  onSubmit?: FieldInputEvent;
  readonly?: boolean;
};

export const RatingFieldInput = ({
  onSubmit,
  readonly,
}: RatingFieldInputProps) => {
  const { rating } = useRatingField();

  const persistField = usePersistField();

  const handleChange = (newRating: RatingValue) => {
    onSubmit?.(() => persistField(newRating));
  };

  return (
    <RatingInput
      availableValues={Object.values(RatingValue)}
      value={rating as RatingValue}
      onChange={handleChange}
      readonly={readonly}
    />
  );
};
