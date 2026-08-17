import { type MediaQueryComparison } from '@/polyfills/media-query/types/MediaQueryComparison';

export type ParsedMediaQueryComparisonPrefix = {
  comparison: MediaQueryComparison;
  baseFeatureName: string;
};
