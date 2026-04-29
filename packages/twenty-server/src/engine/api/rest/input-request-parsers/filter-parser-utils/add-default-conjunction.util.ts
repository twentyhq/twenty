import { Conjunctions } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/parse-filter.util';

export const DEFAULT_CONJUNCTION = Conjunctions.and;

const ROOT_CONJUNCTION_REGEX = new RegExp(
  `^(${Object.values(Conjunctions).join('|')})\\((.+)\\)$`,
);

export const addDefaultConjunctionIfMissing = (filterQuery: string): string => {
  if (!ROOT_CONJUNCTION_REGEX.test(filterQuery)) {
    return `${DEFAULT_CONJUNCTION}(${filterQuery})`;
  }

  return filterQuery;
};
