import { parse } from 'graphql';

export const normalizeGQLField = (query: string) => {
  return parse('{' + query + '}').toString();
};
