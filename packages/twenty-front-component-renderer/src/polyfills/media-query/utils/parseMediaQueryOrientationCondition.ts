import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';

export const parseMediaQueryOrientationCondition = (
  featureValue: string,
): ParsedMediaQueryCondition | null => {
  if (featureValue === 'portrait' || featureValue === 'landscape') {
    return { kind: 'orientation', value: featureValue };
  }

  return null;
};
