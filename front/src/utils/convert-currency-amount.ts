import { isUndefined } from '@sniptt/guards';

export const convertCurrencyToCurrencyMicros = (
  currencyAmount: number | undefined,
) => {
  if (!currencyAmount) {
    return undefined;
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
  currencyAmountMicros: number | undefined,
) => {
  if (isUndefined(currencyAmountMicros)) {
    return undefined;
  }
  const currencyAmountMicrosAsNumber = +currencyAmountMicros;
  if (isNaN(currencyAmountMicrosAsNumber)) {
    throw new Error(`Cannot convert ${currencyAmountMicros} to currency`);
  }
  return currencyAmountMicrosAsNumber / 1000000;
};
