import { FIELD_NUMBER_VARIANT } from 'twenty-shared/types';
import { z } from 'zod';

export const numberFieldDefaultValueSchema = z.object({
  decimals: z.number().nullable(),
  type: z.enum(FIELD_NUMBER_VARIANT).nullable(),
});
