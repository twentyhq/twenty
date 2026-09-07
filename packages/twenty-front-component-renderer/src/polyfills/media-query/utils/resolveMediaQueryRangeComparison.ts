import { type MediaQueryComparison } from '@/polyfills/media-query/types/MediaQueryComparison';
import { type MediaQueryRangeOperator } from '@/polyfills/media-query/types/MediaQueryRangeOperator';

type ResolveMediaQueryRangeComparisonInput = {
  operator: MediaQueryRangeOperator;
  isFeatureNameOnLeft: boolean;
};

const FEATURE_NAME_ON_LEFT_COMPARISONS: Record<
  MediaQueryRangeOperator,
  MediaQueryComparison
> = {
  '>=': 'min',
  '<=': 'max',
  '=': 'exact',
  '>': 'greater-than',
  '<': 'less-than',
};

const FEATURE_NAME_ON_RIGHT_COMPARISONS: Record<
  MediaQueryRangeOperator,
  MediaQueryComparison
> = {
  '>=': 'max',
  '<=': 'min',
  '=': 'exact',
  '>': 'less-than',
  '<': 'greater-than',
};

export const resolveMediaQueryRangeComparison = ({
  operator,
  isFeatureNameOnLeft,
}: ResolveMediaQueryRangeComparisonInput): MediaQueryComparison =>
  isFeatureNameOnLeft
    ? FEATURE_NAME_ON_LEFT_COMPARISONS[operator]
    : FEATURE_NAME_ON_RIGHT_COMPARISONS[operator];
