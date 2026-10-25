import { CURRENCY_CODES } from 'twenty-shared';

export const isValidCurrencyCode = (currencyCode: string): boolean => {
  return Object.values(CURRENCY_CODES).includes(currencyCode as any);
};
