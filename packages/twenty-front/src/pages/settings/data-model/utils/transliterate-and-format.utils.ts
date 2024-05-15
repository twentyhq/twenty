import toCamelCase from 'lodash.camelcase';
import { slugify, transliterate } from 'transliteration';

import { isDefined } from '~/utils/isDefined';

export const transliterateAndFormatOrThrow = (
  string: string,
  validStringPattern: RegExp,
): string => {
  let formattedString = string;

  if (isDefined(formattedString.match(validStringPattern))) {
    return toCamelCase(formattedString);
  }

  formattedString = toCamelCase(
    slugify(transliterate(formattedString, { trim: true })),
  );

  if (!formattedString.match(validStringPattern)) {
    throw new Error(`"${string}" is not a valid name`);
  }

  return formattedString;
};
