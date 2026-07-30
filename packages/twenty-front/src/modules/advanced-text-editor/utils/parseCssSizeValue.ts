export type CssSizeValue = {
  amount: string;
  unit: 'px' | '%' | 'em';
};

const CSS_SIZE_PATTERN = /^(-?[\d.]+)(px|%|em)$/;

// Splits "600px" into amount and unit. Non-numeric values ("auto", "") come
// back with an empty amount so inputs can show their placeholder.
export const parseCssSizeValue = (value: string | undefined): CssSizeValue => {
  const match = (value ?? '').trim().match(CSS_SIZE_PATTERN);

  if (!match) {
    return { amount: '', unit: 'px' };
  }

  return { amount: match[1], unit: match[2] as CssSizeValue['unit'] };
};
