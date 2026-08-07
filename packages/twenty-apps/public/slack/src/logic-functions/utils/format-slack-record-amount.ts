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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode ?? 'USD',
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return amount.toLocaleString('en-US');
  }
};
