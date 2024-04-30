import toCamelCase from 'lodash.camelcase';
import { slugify, transliterate } from 'transliteration';

import { isDefined } from '~/utils/isDefined';

const VALID_STRING_PATTERN = /^[a-zA-Z][a-zA-Z0-9 ]*$/;

export const formatMetadataLabelToMetadataNameOrThrows = (
  string: string,
): string => {
  let formattedString = string;

  if (isDefined(formattedString.match(VALID_STRING_PATTERN))) {
    return toCamelCase(formattedString);
  }

  formattedString = toCamelCase(
    slugify(transliterate(formattedString, { trim: true })),
  );

  if (!formattedString.match(VALID_STRING_PATTERN)) {
    throw new Error(`"${string}" is not a valid name`);
  }

  return formattedString;
};
