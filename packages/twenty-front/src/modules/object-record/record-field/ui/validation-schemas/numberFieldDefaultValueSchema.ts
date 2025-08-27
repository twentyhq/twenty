import { FIELD_NUMBER_VARIANT } from '@/object-record/record-field/ui/types/FieldMetadata';
import { z } from 'zod';

export const numberFieldDefaultValueSchema = z.object({
  decimals: z.number().nullable(),
  type: z.enum(FIELD_NUMBER_VARIANT).nullable(),
});
