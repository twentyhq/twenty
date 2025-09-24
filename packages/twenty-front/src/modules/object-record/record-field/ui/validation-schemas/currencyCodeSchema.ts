import { z } from 'zod';

import { CurrencyCode } from '@/object-record/record-field/ui/types/CurrencyCode';

export const currencyCodeSchema = z.enum(CurrencyCode);
