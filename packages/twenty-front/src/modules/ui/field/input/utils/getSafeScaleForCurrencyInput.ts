import { DEFAULT_DECIMAL_VALUE } from '~/utils/format/formatNumber';

type GetSafeScaleForCurrencyInputParams = {
  value: string;
  decimals?: number;
};

const UNMASKED_VALUE_PATTERN = /^-?\d*\.(\d+)$/;

// The mask would silently truncate or misread an existing amount that has more
// decimals than the field settings allow, so the scale is widened to fit it
export const getSafeScaleForCurrencyInput = ({
  value,
  decimals = DEFAULT_DECIMAL_VALUE,
}: GetSafeScaleForCurrencyInputParams): number => {
  const decimalPart = UNMASKED_VALUE_PATTERN.exec(value)?.[1];

  return Math.max(decimals, decimalPart?.length ?? 0);
};
