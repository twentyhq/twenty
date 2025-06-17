import { fieldMetadataCurrencyFormat } from '@/object-record/record-field/types/FieldMetadata';
import { z } from 'zod';

export const currencyFieldSettingsSchema = z.object({
  format: z.enum(fieldMetadataCurrencyFormat),
});
