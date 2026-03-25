import { z } from 'zod';

import { CurrencyCode } from 'twenty-shared/constants';

export const currencyCodeSchema = z.enum(CurrencyCode);
