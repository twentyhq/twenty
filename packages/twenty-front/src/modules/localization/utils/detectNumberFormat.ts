import { NumberFormat } from '@/localization/constants/NumberFormat';

export const detectNumberFormat = (): NumberFormat => {
  const testNumber = 1234567.89;
  const language = navigator?.language || 'en-US';
  const formatter = new Intl.NumberFormat(language);
  const parts = formatter.formatToParts(testNumber);

  const thousandSeparator =
    parts.find((part) => part.type === 'group')?.value || '';
  const decimalSeparator =
    parts.find((part) => part.type === 'decimal')?.value || '';

  if (thousandSeparator === ',' && decimalSeparator === '.') {
    return NumberFormat.COMMAS_AND_DOT;
  }
  if (thousandSeparator === ' ' && decimalSeparator === ',') {
    return NumberFormat.SPACES_AND_COMMA;
  }
  if (thousandSeparator === ' ' && decimalSeparator === '.') {
    return NumberFormat.SPACES_AND_DOT;
  }

  return NumberFormat.COMMAS_AND_DOT;
};
