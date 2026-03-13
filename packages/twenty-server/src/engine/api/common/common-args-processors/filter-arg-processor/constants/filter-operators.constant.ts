import { type FilterOperator } from 'src/engine/api/common/common-args-processors/filter-arg-processor/types/filter-operator.type';

export const STRING_FILTER_OPERATORS: FilterOperator[] = [
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
  'in',
  'is',
];

export const UUID_FILTER_OPERATORS: FilterOperator[] = [
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'is',
];

export const ARRAY_FILTER_OPERATORS: FilterOperator[] = [
  'containsIlike',
  'is',
  'isEmptyArray',
];

export const MULTI_SELECT_FILTER_OPERATORS: FilterOperator[] = [
  'containsAny',
  'is',
  'isEmptyArray',
];

export const ENUM_FILTER_OPERATORS: FilterOperator[] = [
  'eq',
  'neq',
  'in',
  'containsAny',
  'is',
  'isEmptyArray',
];

export const RAW_JSON_FILTER_OPERATORS: FilterOperator[] = ['is', 'like'];

export const RICH_TEXT_FILTER_OPERATORS: FilterOperator[] = ['ilike'];
