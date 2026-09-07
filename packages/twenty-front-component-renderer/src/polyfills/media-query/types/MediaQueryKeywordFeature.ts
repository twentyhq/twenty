import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';

export type MediaQueryKeywordFeature = {
  values: Set<string>;
  readValue: (environment: MediaQueryEnvironment) => string;
};
