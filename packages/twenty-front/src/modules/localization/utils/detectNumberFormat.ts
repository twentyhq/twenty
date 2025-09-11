import { type NumberFormat } from '@/localization/constants/NumberFormat';

export const detectNumberFormat = (): keyof typeof NumberFormat => {
  try {
    const testNumber = 1234.56;
    const language = navigator.language;

    // Get the format directly based on common locales
    if (language.startsWith('en')) {
      return 'COMMAS_AND_DOT'; // English-speaking countries use 1,234.56
    }
    if (language.startsWith('fr')) {
      return 'SPACES_AND_COMMA'; // French uses 1 234,56
    }
    if (language.startsWith('de')) {
      return 'SPACES_AND_DOT'; // German uses 1 234.56
    }

    // For other locales, detect based on the formatted number
    const formatted = new Intl.NumberFormat(language).format(testNumber);

    // First check for decimal separator
    if (formatted.includes(',')) {
      const parts = formatted.split(',');
      if (parts[1]?.length === 2) {
        // Comma is decimal separator
        return formatted.includes(' ') ? 'SPACES_AND_COMMA' : 'COMMAS_AND_DOT';
      }
    }

    if (formatted.includes('.')) {
      const parts = formatted.split('.');
      if (parts[1]?.length === 2) {
        // Dot is decimal separator
        return formatted.includes(' ') ? 'SPACES_AND_DOT' : 'COMMAS_AND_DOT';
      }
    }

    // If detection was inconclusive
    return 'COMMAS_AND_DOT';
  } catch {
    // If any error occurs during detection, return default format
    return 'COMMAS_AND_DOT';
  }
};
