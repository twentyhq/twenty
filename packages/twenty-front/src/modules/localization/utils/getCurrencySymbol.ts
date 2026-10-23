export const getCurrencySymbol = (currency: string): string => {
  const normalizedCurrency = currency.toUpperCase();

  try {
    return (
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: normalizedCurrency,
      })
        .formatToParts(0)
        .find((part) => part.type === 'currency')?.value ?? normalizedCurrency
    );
  } catch {
    return normalizedCurrency;
  }
};
