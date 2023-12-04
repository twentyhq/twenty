import { z } from 'zod';

import { FieldRatingValue } from '../FieldMetadata';

const ratingSchema = z
  .string()
  .transform((value) => +value)
  .pipe(z.number().int().min(1).max(5));

export const isFieldRatingValue = (
  fieldValue: unknown,
): fieldValue is FieldRatingValue => ratingSchema.safeParse(fieldValue).success;
