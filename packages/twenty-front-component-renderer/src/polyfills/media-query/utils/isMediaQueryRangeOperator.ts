import { MEDIA_QUERY_RANGE_OPERATORS } from '@/polyfills/media-query/constants/MediaQueryRangeOperators';
import { type MediaQueryRangeOperator } from '@/polyfills/media-query/types/MediaQueryRangeOperator';

export const isMediaQueryRangeOperator = (
  value: string,
): value is MediaQueryRangeOperator =>
  MEDIA_QUERY_RANGE_OPERATORS.has(value as MediaQueryRangeOperator);
