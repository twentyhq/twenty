/* @license Enterprise */

// Credit amounts are summed into a signed Int64 usage column and applied to the
// cached counter through Redis INCRBY. A negative amount subtracts from the
// period's usage sum and hands the workspace credits rather than charging it,
// and a fractional or out-of-safe-range one is not a value either side can
// hold.
export const isValidCreditAmountMicro = (amountMicro: number): boolean =>
  Number.isSafeInteger(amountMicro) && amountMicro >= 0;
