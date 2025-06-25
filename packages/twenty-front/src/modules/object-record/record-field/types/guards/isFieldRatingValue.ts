import { RATING_VALUES } from '@/object-record/record-field/meta-types/constants/RatingValues';

import { FieldRatingValue } from '../FieldMetadata';

export const isFieldRatingValue = (
  fieldValue: unknown,
): fieldValue is FieldRatingValue =>
  RATING_VALUES.includes(fieldValue as NonNullable<FieldRatingValue>);
