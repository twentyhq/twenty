import { Conjunctions } from 'src/engine/api/rest/rest-api-core-query-builder/factories/input-factories/filter-utils/parse-filter.utils';

export const DEFAULT_CONJUNCTION = Conjunctions.and;

export const addDefaultConjunctionIfMissing = (filterQuery: string): string => {
  if (!(filterQuery.includes('(') && filterQuery.includes(')'))) {
    return `${DEFAULT_CONJUNCTION}(${filterQuery})`;
  }

  return filterQuery;
};
