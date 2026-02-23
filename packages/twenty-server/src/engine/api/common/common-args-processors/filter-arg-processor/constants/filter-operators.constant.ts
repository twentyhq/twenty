import { type FilterOperator } from 'src/engine/api/common/common-args-processors/filter-arg-processor/types/filter-operator.type';

export const SUPPORTED_FILTER_OPERATORS = [
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
  'contains',
  'notContains',
  'containsAny',
  'containsIlike',
  'search',
  'isEmptyArray',
] as const;

export const ARRAY_FILTER_OPERATORS: FilterOperator[] = [
  'in',
  'contains',
  'notContains',
  'containsAny',
];

export const STRING_FILTER_OPERATORS: FilterOperator[] = [
  'eq',
  'neq',
  'in',
  'is',
  'like',
  'ilike',
  'startsWith',
  'endsWith',
  'search',
];

export const NUMBER_FILTER_OPERATORS: FilterOperator[] = [
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'is',
];

export const BOOLEAN_FILTER_OPERATORS: FilterOperator[] = ['eq', 'is'];

export const DATE_FILTER_OPERATORS: FilterOperator[] = [
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'is',
];

export const UUID_FILTER_OPERATORS: FilterOperator[] = ['eq', 'neq', 'in', 'is'];

export const ARRAY_FIELD_FILTER_OPERATORS: FilterOperator[] = [
  'contains',
  'notContains',
  'containsAny',
  'containsIlike',
  'isEmptyArray',
  'is',
];

export const SELECT_FILTER_OPERATORS: FilterOperator[] = ['eq', 'neq', 'in', 'is'];

export const JSON_FILTER_OPERATORS: FilterOperator[] = ['is'];
