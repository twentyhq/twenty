import {
  Conjunctions,
  ROOT_FILTER_CONJUNCTION_REGEX,
} from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/parse-filter.util';

export const DEFAULT_CONJUNCTION = Conjunctions.and;

export const addDefaultConjunctionIfMissing = (filterQuery: string): string => {
  if (!ROOT_FILTER_CONJUNCTION_REGEX.test(filterQuery)) {
    return `${DEFAULT_CONJUNCTION}(${filterQuery})`;
  }

  return filterQuery;
};
