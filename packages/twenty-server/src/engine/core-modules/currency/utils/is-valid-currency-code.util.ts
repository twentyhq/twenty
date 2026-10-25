import { CURRENCY_CODE_LABELS } from 'twenty-shared/constants';

export const isValidCurrencyCode = (currencyCode: string): boolean => {
  if (
    !currencyCode ||
    typeof currencyCode !== 'string' ||
    currencyCode.length !== 3
  ) {
    return false;
  }

  const upperCode = currencyCode.toUpperCase();
  if (upperCode in CURRENCY_CODE_LABELS) {
    return true;
  }

  try {
    const formatter = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: upperCode,
    });
    return formatter.resolvedOptions().currency === upperCode;
  } catch {
    return false;
  }
};
