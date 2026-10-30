import { slugify } from 'transliteration';
import { doNotTranslate } from 'twenty-shared/i18n';

export const computeOptionValueFromLabel = (label: string): string => {
  const prefixedLabel = /^\d/.test(label)
    ? doNotTranslate(`OPT${label}`)
    : label;

  const formattedString = slugify(prefixedLabel, {
    trim: true,
    separator: '_',
    allowedChars: 'a-zA-Z0-9_',
  });

  return formattedString.toUpperCase();
};
