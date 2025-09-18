import { NumberFormat } from '@/localization/constants/NumberFormat';

const SPACE_CHARS = new Set([' ', '\u00A0', '\u202F']); // space, non-breaking space, narrow no-break space
const APOSTROPHE_CHARS = new Set(["'", '\u2019']); // apostrophe, right single quotation mark

const FORMAT_PATTERNS = new Map<string, keyof typeof NumberFormat>([
  [',|.', NumberFormat.COMMAS_AND_DOT],
  ['.|,', NumberFormat.DOTS_AND_COMMA],
  ['space|,', NumberFormat.SPACES_AND_COMMA],
  ['apostrophe|.', NumberFormat.APOSTROPHE_AND_DOT],
]);

export const detectNumberFormat = (): keyof typeof NumberFormat => {
  try {
    const testNumber = 1234567.89;
    const language = navigator?.language || 'en-US';

    const formatter = new Intl.NumberFormat(language);
    const parts = formatter.formatToParts(testNumber);
    const thousandSeparator =
      parts.find((part) => part.type === 'group')?.value || '';
    const decimalSeparator =
      parts.find((part) => part.type === 'decimal')?.value || '';

    let thousandCategory: string;
    if (SPACE_CHARS.has(thousandSeparator)) {
      thousandCategory = 'space';
    } else if (APOSTROPHE_CHARS.has(thousandSeparator)) {
      thousandCategory = 'apostrophe';
    } else {
      thousandCategory = thousandSeparator;
    }

    const pattern = `${thousandCategory}|${decimalSeparator}`;
    return FORMAT_PATTERNS.get(pattern) || NumberFormat.COMMAS_AND_DOT;
  } catch {
    return NumberFormat.COMMAS_AND_DOT;
  }
};
