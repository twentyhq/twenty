import { isNonEmptyString } from '@sniptt/guards';

// Strip characters that would break the REST filter DSL or act as ilike wildcards.
const sanitizeSearchTerm = (value: string): string =>
  value.replace(/[(),[\]:%\\_]/g, ' ').trim();

// Each word must match a name part, so "Ada Lovelace" finds the member whose
// first name matches "Ada" and last name matches "Lovelace" (in any order).
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

  return wordFilters.length === 1 ? wordFilters[0] : `and(${wordFilters.join(',')})`;
};
