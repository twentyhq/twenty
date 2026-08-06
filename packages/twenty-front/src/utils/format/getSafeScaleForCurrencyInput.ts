type SafeScaleProps = {
  value: string;
  decimals?: number;
};
export const getSafeScaleForCurrencyInput = ({
  value,
  decimals,
}: SafeScaleProps): number => {
  const decimalPart = value.split('.')[1];
  const decimalCount = decimalPart?.length ?? 0;

  return Math.max(decimalCount, decimals ?? 0);
};
