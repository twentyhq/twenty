const MICROS_PER_UNIT = 1_000_000;

export const formatSlackRecordAmount = ({
  amountMicros,
  currencyCode,
}: {
  amountMicros: number;
  currencyCode: string | undefined;
}): string => {
  const amount = amountMicros / MICROS_PER_UNIT;

  try {
    // minimumFractionDigits 0 drops trailing zeros on whole amounts while
    // keeping each currency's own maximum minor-unit precision
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode ?? 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return amount.toLocaleString('en-US');
  }
};
