import { parse } from 'graphql';

export const normalizeGQLQuery = (query: string) => {
  // Parse the query to an AST, then print it back to a string.
  // This normalizes whitespace and sorts fields alphabetically.
  // Used in tests to compare queries.
  return parse(query).toString();
};
