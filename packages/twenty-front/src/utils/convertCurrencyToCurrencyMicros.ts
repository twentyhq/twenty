export const convertCurrencyAmountToCurrencyMicros = (
  currencyAmount: number,
) => {
  const currencyAmountAsMicros = currencyAmount * 1000000;

  return currencyAmountAsMicros;
};

export const convertCurrencyMicrosToCurrencyAmount = (
  currencyAmountMicros: number,
) => {
  return currencyAmountMicros / 1000000;
};
