import toCamelCase from 'lodash.camelcase';
import { slugify, transliterate } from 'transliteration';

import { isDefined } from '~/utils/isDefined';

const VALID_STRING_PATTERN = /^[a-zA-Z][a-zA-Z0-9 ]*$/;

export const formatString = (string: string): string => {
  let formattedString = string;

  if (isDefined(formattedString.match(VALID_STRING_PATTERN))) {
    return toCamelCase(formattedString);
  }

  formattedString = toCamelCase(
    slugify(transliterate(formattedString, { trim: true })),
  );

  return formattedString;
};
