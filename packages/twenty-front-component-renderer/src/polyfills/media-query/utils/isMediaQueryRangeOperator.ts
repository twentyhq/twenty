import { type MediaQueryComparisonOperator } from '@/polyfills/media-query/types/MediaQueryComparisonOperator';

const MEDIA_QUERY_RANGE_OPERATORS = new Set<string>([
  '<',
  '<=',
  '>',
  '>=',
  '=',
]);

export const isMediaQueryRangeOperator = (
  value: string,
): value is MediaQueryComparisonOperator =>
  MEDIA_QUERY_RANGE_OPERATORS.has(value);
