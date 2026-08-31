import { isNonEmptyString } from '@sniptt/guards';

const sanitizeSearchTerm = (value: string): string =>
  value.replace(/[(),[\]:%\\_]/g, ' ').trim();

export const buildWorkspaceMemberSearchFilter = (
  searchTerm: string,
): string | undefined => {
  const words = sanitizeSearchTerm(searchTerm)
    .split(/\s+/)
    .filter(isNonEmptyString);

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
