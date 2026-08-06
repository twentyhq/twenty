import { DEFAULT_DECIMAL_VALUE } from '~/utils/format/formatNumber';

type GetSafeScaleForCurrencyInputParams = {
  value: string;
  decimals?: number;
};

const UNMASKED_VALUE_PATTERN = /^-?\d*\.(\d+)$/;

export const getSafeScaleForCurrencyInput = ({
  value,
  decimals = DEFAULT_DECIMAL_VALUE,
}: GetSafeScaleForCurrencyInputParams): number => {
  const decimalPart = UNMASKED_VALUE_PATTERN.exec(value)?.[1];

  return Math.max(decimals, decimalPart?.length ?? 0);
};
