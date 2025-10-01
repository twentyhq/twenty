import { RATING_VALUES } from 'twenty-shared/constants';
import { type FieldRatingValue } from 'twenty-shared/types';

export const isFieldRatingValue = (
  fieldValue: unknown,
): fieldValue is FieldRatingValue =>
  RATING_VALUES.includes(fieldValue as NonNullable<FieldRatingValue>);
