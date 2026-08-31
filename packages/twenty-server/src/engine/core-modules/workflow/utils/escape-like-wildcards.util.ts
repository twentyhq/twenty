// Escapes LIKE/ILIKE wildcards so the search term only matches literally;
// queries using the result must declare ESCAPE '\'
export const escapeLikeWildcards = (searchTerm: string): string =>
  searchTerm.replace(/[\\%_]/g, '\\$&');
