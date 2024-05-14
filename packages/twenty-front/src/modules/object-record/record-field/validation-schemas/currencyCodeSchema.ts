import { z } from 'zod';

import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';

export const currencyCodeSchema = z.nativeEnum(CurrencyCode);
