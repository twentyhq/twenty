import { parse } from 'graphql';

export const normalizeGQLField = (query: string) => {
  // Parse the query to an AST, then print it back to a string.
  // This normalizes whitespace and sorts fields alphabetically.
  // Used in tests to compare fields regardless of order.
  return parse('{' + query + '}').toString();
};
