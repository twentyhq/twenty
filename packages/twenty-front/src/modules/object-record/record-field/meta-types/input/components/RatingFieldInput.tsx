import { FieldRatingValue } from '@/object-record/field/types/FieldMetadata';
import { RatingInput } from '@/ui/field/input/components/RatingInput';

import { usePersistField } from '../../../hooks/usePersistField';
import { useRatingField } from '../../hooks/useRatingField';

import { FieldInputEvent } from './DateFieldInput';

export type RatingFieldInputProps = {
  onSubmit?: FieldInputEvent;
  readonly?: boolean;
};

export const RATING_VALUES = [
  'RATING_1',
  'RATING_2',
  'RATING_3',
  'RATING_4',
  'RATING_5',
] as const;

export const RatingFieldInput = ({
  onSubmit,
  readonly,
}: RatingFieldInputProps) => {
  const { rating } = useRatingField();

  const persistField = usePersistField();

  const handleChange = (newRating: FieldRatingValue) => {
    onSubmit?.(() => persistField(newRating));
  };

  return (
    <RatingInput value={rating} onChange={handleChange} readonly={readonly} />
  );
};
