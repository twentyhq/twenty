import { isNonEmptyString } from '@sniptt/guards';

// Allow-list rather than strip today's delimiters: the REST filter grammar can
// grow new ones, and a name only needs letters, digits and these marks.
const NON_NAME_CHARACTERS = /[^\p{L}\p{M}\p{N}'\-.]+/gu;

const toSearchWords = (searchTerm: string): string[] =>
  searchTerm
    .replace(NON_NAME_CHARACTERS, ' ')
    .split(' ')
    .filter(isNonEmptyString);

export const buildWorkspaceMemberSearchFilter = (
  searchTerm: string,
): string | undefined => {
  const words = toSearchWords(searchTerm);

  if (words.length === 0) {
    return undefined;
  }

  const wordFilters = words.map(
    (word) =>
      `or(name.firstName[ilike]:%${word}%,name.lastName[ilike]:%${word}%)`,
  );

  return wordFilters.length === 1
    ? wordFilters[0]
    : `and(${wordFilters.join(',')})`;
};
