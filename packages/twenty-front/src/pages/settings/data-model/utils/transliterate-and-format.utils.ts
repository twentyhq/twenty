import { slugify } from 'transliteration';

import { isDefined } from '~/utils/isDefined';

export const transliterateAndFormatOrThrow = (
  string: string,
  validStringPattern: RegExp,
): string => {
  if (isDefined(string.match(validStringPattern))) {
    return string;
  }

  const formattedString = slugify(string, {
    trim: true,
    separator: '_',
  });

  if (!formattedString.match(validStringPattern)) {
    throw new Error(`"${string}" is not a valid name`);
  }

  return formattedString;
};
