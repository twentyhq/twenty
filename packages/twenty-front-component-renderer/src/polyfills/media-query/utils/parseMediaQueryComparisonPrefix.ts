import { type ParsedMediaQueryComparisonPrefix } from '@/polyfills/media-query/types/ParsedMediaQueryComparisonPrefix';

export const parseMediaQueryComparisonPrefix = (
  featureName: string,
): ParsedMediaQueryComparisonPrefix => {
  if (featureName.startsWith('min-')) {
    return {
      comparison: 'min',
      baseFeatureName: featureName.slice('min-'.length),
    };
  }

  if (featureName.startsWith('max-')) {
    return {
      comparison: 'max',
      baseFeatureName: featureName.slice('max-'.length),
    };
  }

  return { comparison: 'exact', baseFeatureName: featureName };
};
