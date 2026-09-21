export type CssSizeValue = {
  amount: string;
  unit: 'px' | '%' | 'em';
};

const CSS_SIZE_PATTERN = /^(-?(?:\d+|\d*\.\d+))(px|%|em)$/;

export const parseCssSizeValue = (value: string | undefined): CssSizeValue => {
  const match = (value ?? '').trim().match(CSS_SIZE_PATTERN);

  if (!match) {
    return { amount: '', unit: 'px' };
  }

  return { amount: match[1], unit: match[2] as CssSizeValue['unit'] };
};
