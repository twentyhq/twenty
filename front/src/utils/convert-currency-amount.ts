export const convertCurrencyToCurrencyMicros = (
  currencyAmount: number | null | undefined,
) => {
  if (currencyAmount == null) {
    return null;
  }
  const currencyAmountAsNumber = +currencyAmount;
  if (isNaN(currencyAmountAsNumber)) {
    throw new Error(`Cannot convert ${currencyAmount} to micros`);
  }
  const currencyAmountAsMicros = currencyAmountAsNumber * 1000000;
  if (currencyAmountAsMicros % 1 !== 0) {
    throw new Error(`Cannot convert ${currencyAmount} to micros`);
  }
  return currencyAmountAsMicros;
};

export const convertCurrencyMicrosToCurrency = (
  currencyAmountMicros: number | null | undefined,
) => {
  if (currencyAmountMicros == null) {
    return null;
  }
  const currencyAmountMicrosAsNumber = +currencyAmountMicros;
  if (isNaN(currencyAmountMicrosAsNumber)) {
    throw new Error(`Cannot convert ${currencyAmountMicros} to currency`);
  }
  return currencyAmountMicrosAsNumber / 1000000;
};
