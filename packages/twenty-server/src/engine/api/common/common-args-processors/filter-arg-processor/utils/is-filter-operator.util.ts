import { type FilterOperator } from 'src/engine/api/common/common-args-processors/filter-arg-processor/types/filter-operator.type';

const FILTER_OPERATORS: Record<FilterOperator, true> = {
  eq: true,
  neq: true,
  gt: true,
  gte: true,
  lt: true,
  lte: true,
  in: true,
  is: true,
  like: true,
  ilike: true,
  startsWith: true,
  endsWith: true,
  containsAny: true,
  containsIlike: true,
  isEmptyArray: true,
  search: true,
};

const FILTER_OPERATOR_SET = new Set<string>(Object.keys(FILTER_OPERATORS));

export const isFilterOperator = (key: string): key is FilterOperator =>
  FILTER_OPERATOR_SET.has(key);
