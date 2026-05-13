import { type FilterOperator } from 'src/engine/api/common/common-args-processors/filter-arg-processor/types/filter-operator.type';

// Every leaf (per-field) filter operator that a value object's keys can be.
// Logical operators `and`/`or`/`not` are intentionally excluded — they
// combine sub-filters, they don't terminate one.
export const ALL_LEAF_FILTER_OPERATOR_NAMES: readonly FilterOperator[] = [
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'is',
  'like',
  'ilike',
  'startsWith',
  'endsWith',
  'containsAny',
  'containsIlike',
  'isEmptyArray',
  'search',
];
