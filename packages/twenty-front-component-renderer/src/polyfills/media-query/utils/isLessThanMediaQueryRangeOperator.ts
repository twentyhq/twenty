import { type MediaQueryRangeOperator } from '@/polyfills/media-query/types/MediaQueryRangeOperator';

export const isLessThanMediaQueryRangeOperator = (
  operator: MediaQueryRangeOperator,
): boolean => operator === '<' || operator === '<=';
