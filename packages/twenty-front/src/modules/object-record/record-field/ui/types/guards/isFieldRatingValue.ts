import { RATING_VALUES } from '@/object-record/record-field/ui/constants/RatingValues';
import { type FieldRatingValue } from '@/object-record/record-field/ui/types/FieldRatingValue';

export const isFieldRatingValue = (
  fieldValue: unknown,
): fieldValue is FieldRatingValue =>
  RATING_VALUES.includes(fieldValue as NonNullable<FieldRatingValue>);
