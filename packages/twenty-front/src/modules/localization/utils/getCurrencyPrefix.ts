import { isNonEmptyString } from '@sniptt/guards';

export const getCurrencyPrefix = (currency: string): string => {
  const normalizedCurrency = currency.toUpperCase();

  try {
    const currencyPrefix = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: normalizedCurrency,
    })
      .formatToParts(0)
      .filter((part) => part.type === 'currency' || part.type === 'literal')
      .map((part) => part.value)
      .join('');

    return isNonEmptyString(currencyPrefix)
      ? currencyPrefix
      : normalizedCurrency;
  } catch {
    return normalizedCurrency;
  }
};
