import { type MediaQueryNumericSource } from '@/polyfills/media-query/types/MediaQueryNumericSource';

export type MediaQueryNumericFeature = {
  source: MediaQueryNumericSource;
  parseValue: (featureValue: string) => number | null;
};
