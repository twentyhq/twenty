import { fieldMetadataCurrencyFormat } from '@/object-record/record-field/ui/types/FieldMetadata';
import { z } from 'zod';

export const currencyFieldSettingsSchema = z.object({
  format: z.enum(fieldMetadataCurrencyFormat),
  decimals: z.number().optional(),
});
