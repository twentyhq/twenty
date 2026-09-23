export const convertCurrencyAmountToCurrencyMicros = (
  currencyAmount: number,
) => {
  // Float multiplication drifts (8.2 * 1e6 === 8199999.999999999) and micros are whole numbers
  return Math.round(currencyAmount * 1000000);
};

export const convertCurrencyMicrosToCurrencyAmount = (
  currencyAmountMicros: number,
) => {
  return currencyAmountMicros / 1000000;
};
