import { z } from 'zod';

import { FieldRatingValue } from '../FieldMetadata';

const ratingSchema = z.string().pipe(z.nativeEnum(FieldRatingValue));

export const isFieldRatingValue = (
  fieldValue: unknown,
): fieldValue is FieldRatingValue => ratingSchema.safeParse(fieldValue).success;
