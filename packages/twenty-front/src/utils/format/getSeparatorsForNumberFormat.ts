import { NumberFormat } from '@/localization/constants/NumberFormat';

export type NumberFormatSeparators = {
  thousandsSeparator: string;
  radix: string;
};

export const getSeparatorsForNumberFormat = (
  format: NumberFormat,
): NumberFormatSeparators => {
  switch (format) {
    case NumberFormat.SPACES_AND_COMMA:
      return {
        thousandsSeparator: ' ',
        radix: ',',
      };
    case NumberFormat.DOTS_AND_COMMA:
      return {
        thousandsSeparator: '.',
        radix: ',',
      };
    case NumberFormat.APOSTROPHE_AND_DOT:
      return {
        thousandsSeparator: "'",
        radix: '.',
      };
    case NumberFormat.SYSTEM:
    case NumberFormat.COMMAS_AND_DOT:
    default:
      return {
        thousandsSeparator: ',',
        radix: '.',
      };
  }
};
