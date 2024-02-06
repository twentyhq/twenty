import { z } from 'zod';

import { RATING_VALUES } from '@/object-record/record-field/meta-types/constants/RatingValues';

import { FieldRatingValue } from '../FieldMetadata';

const ratingSchema = z.string().pipe(z.enum(RATING_VALUES));

export const isFieldRatingValue = (
  fieldValue: unknown,
): fieldValue is FieldRatingValue => ratingSchema.safeParse(fieldValue).success;
