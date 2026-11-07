import { CurrencyCode } from 'twenty-shared/constants';

// Withdrawn from ISO 4217 but still stored on existing records, so only pickers hide them
export const WITHDRAWN_CURRENCY_CODES: readonly string[] = [CurrencyCode.ANG];
