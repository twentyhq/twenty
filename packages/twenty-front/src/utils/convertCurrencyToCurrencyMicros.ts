export const convertCurrencyAmountToCurrencyMicros = (
  currencyAmount: number,
) => {
  return Math.round(currencyAmount * 1000000);
};

export const convertCurrencyMicrosToCurrencyAmount = (
  currencyAmountMicros: number,
) => {
  return currencyAmountMicros / 1000000;
};
