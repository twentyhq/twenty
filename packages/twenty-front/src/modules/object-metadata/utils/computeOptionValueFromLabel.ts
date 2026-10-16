import { slugify } from 'transliteration';

export const computeOptionValueFromLabel = (label: string): string => {
  // Metadata and protocol identifiers must stay stable across locales.
  // oxlint-disable-next-line lingui/no-unlocalized-strings
  const prefixedLabel = /^\d/.test(label) ? `OPT${label}` : label;

  const formattedString = slugify(prefixedLabel, {
    trim: true,
    separator: '_',
    allowedChars: 'a-zA-Z0-9_',
  });

  return formattedString.toUpperCase();
};
