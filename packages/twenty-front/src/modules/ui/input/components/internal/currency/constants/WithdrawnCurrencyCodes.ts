import { CurrencyCode } from 'twenty-shared/constants';

// Still in CurrencyCode so values saved before their replacement keep validating
export const WITHDRAWN_CURRENCY_CODES: ReadonlySet<string> = new Set([
  CurrencyCode.ANG,
]);
