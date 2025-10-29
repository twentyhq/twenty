import { Conjunctions } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/parse-filter.util';

export const DEFAULT_CONJUNCTION = Conjunctions.and;

export const addDefaultConjunctionIfMissing = (filterQuery: string): string => {
  if (!(filterQuery.includes('(') && filterQuery.includes(')'))) {
    return `${DEFAULT_CONJUNCTION}(${filterQuery})`;
  }

  return filterQuery;
};
