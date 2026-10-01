import { parse } from 'graphql';

export const normalizeGQLQuery = (query: string) => {
  return parse(query).toString();
};
