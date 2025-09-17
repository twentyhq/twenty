import { NumberFormat } from '@/localization/constants/NumberFormat';

export const detectNumberFormat = (): NumberFormat => {
  const testNumber = 1234567.89;
  let language = navigator?.language || 'en-US';

  let formatter: Intl.NumberFormat;
  try {
    formatter = new Intl.NumberFormat(language);
  } catch {
    language = 'en-US';
    formatter = new Intl.NumberFormat(language);
  }

  const parts = formatter.formatToParts(testNumber);

  const thousandSeparator =
    parts.find((part) => part.type === 'group')?.value || '';
  const decimalSeparator =
    parts.find((part) => part.type === 'decimal')?.value || '';

  if (thousandSeparator === ',' && decimalSeparator === '.') {
    return NumberFormat.COMMAS_AND_DOT;
  }
  // Handle various space characters (regular space, non-breaking space, narrow no-break space)
  if (
    (thousandSeparator === ' ' ||
      thousandSeparator === '\u00A0' ||
      thousandSeparator === '\u202F') &&
    decimalSeparator === ','
  ) {
    return NumberFormat.SPACES_AND_COMMA;
  }
  if (thousandSeparator === '.' && decimalSeparator === ',') {
    return NumberFormat.DOTS_AND_COMMA;
  }
  // Handle various apostrophe-like characters (apostrophe, right single quotation mark)
  if (
    (thousandSeparator === "'" || thousandSeparator === '\u2019') &&
    decimalSeparator === '.'
  ) {
    return NumberFormat.APOSTROPHE_AND_DOT;
  }

  return NumberFormat.COMMAS_AND_DOT;
};
