import { NumberFormat } from '@/localization/constants/NumberFormat';

export const detectNumberFormat = (): NumberFormat => {
  try {
    const language = navigator.language;

    if (language.startsWith('en')) {
      return NumberFormat.COMMAS_AND_DOT;
    }
    if (language.startsWith('fr')) {
      return NumberFormat.SPACES_AND_COMMA;
    }
    if (language.startsWith('de')) {
      return NumberFormat.SPACES_AND_DOT;
    }

    return NumberFormat.COMMAS_AND_DOT;
  } catch {
    return NumberFormat.COMMAS_AND_DOT;
  }
};
