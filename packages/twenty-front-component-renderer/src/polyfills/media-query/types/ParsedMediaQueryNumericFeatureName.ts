import { type MediaQueryComparison } from '@/polyfills/media-query/types/MediaQueryComparison';
import { type MediaQueryNumericFeature } from '@/polyfills/media-query/types/MediaQueryNumericFeature';

export type ParsedMediaQueryNumericFeatureName = {
  comparison: MediaQueryComparison;
  feature: MediaQueryNumericFeature;
};
