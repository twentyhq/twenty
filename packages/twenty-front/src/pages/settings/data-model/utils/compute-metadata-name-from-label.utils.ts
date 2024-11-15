import camelCase from 'lodash.camelcase';
import { slugify } from 'transliteration';

export const computeMetadataNameFromLabel = (label: string): string => {
  const prefixedLabel = /^\d/.test(label) ? `n${label}` : label;

  if (prefixedLabel === '') {
    return '';
  }

  const formattedString = slugify(prefixedLabel, {
    trim: true,
    separator: '_',
    allowedChars: 'a-zA-Z0-9',
  });

  if (formattedString === '') {
    throw new Error('Invalid label');
  }

  return camelCase(formattedString);
};
