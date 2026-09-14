export const CURRENCY_INPUT_MAX_SCALE = 6;

type GetSafeScaleForCurrencyInputParams = {
  value?: string;
  decimals?: number;
};

export const getSafeScaleForCurrencyInput = (
  _params?: GetSafeScaleForCurrencyInputParams,
): number => {
  return CURRENCY_INPUT_MAX_SCALE;
};
