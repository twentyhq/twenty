import { isDefined } from 'twenty-shared/utils';
export type CssSizeValue = {
  amount: string;
  unit: 'px' | '%' | 'em';
};

const CSS_SIZE_PATTERN = /^(-?(?:\d+|\d*\.\d+))(px|%|em)$/;

export const parseCssSizeValue = (value: string | undefined): CssSizeValue => {
  const [, amount, unit] = (value ?? '').trim().match(CSS_SIZE_PATTERN) ?? [];

  if (!isDefined(amount) || !isDefined(unit)) {
    return { amount: '', unit: 'px' };
  }

  return { amount, unit: unit as CssSizeValue['unit'] };
};
