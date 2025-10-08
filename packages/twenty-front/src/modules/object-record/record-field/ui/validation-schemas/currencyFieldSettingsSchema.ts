import { CURRENCY_FORMAT } from 'twenty-shared/types';
import { z } from 'zod';

export const currencyFieldSettingsSchema = z.object({
  format: z.enum(CURRENCY_FORMAT),
});
