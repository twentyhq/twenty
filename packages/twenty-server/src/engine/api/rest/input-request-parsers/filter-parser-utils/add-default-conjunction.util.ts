import { isWrappedInSingleRootConjunction } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/is-wrapped-in-single-root-conjunction.util';
import { Conjunctions } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/parse-filter.util';

export const DEFAULT_CONJUNCTION = Conjunctions.and;

export const addDefaultConjunctionIfMissing = (filterQuery: string): string => {
  if (!isWrappedInSingleRootConjunction(filterQuery)) {
    return `${DEFAULT_CONJUNCTION}(${filterQuery})`;
  }

  return filterQuery;
};
