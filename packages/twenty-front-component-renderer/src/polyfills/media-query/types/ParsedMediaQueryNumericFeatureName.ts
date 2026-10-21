import { type MediaQueryComparisonOperator } from '@/polyfills/media-query/types/MediaQueryComparisonOperator';
import { type MediaQueryNumericFeature } from '@/polyfills/media-query/types/MediaQueryNumericFeature';

export type ParsedMediaQueryNumericFeatureName = {
  operator: MediaQueryComparisonOperator;
  feature: MediaQueryNumericFeature;
};
