import { type MediaQueryKeywordFeature } from '@/polyfills/media-query/types/MediaQueryKeywordFeature';

export const MEDIA_QUERY_KEYWORD_FEATURES = new Map<
  string,
  MediaQueryKeywordFeature
>([
  [
    'prefers-color-scheme',
    {
      values: new Set(['light', 'dark']),
      readValue: (environment) => environment.colorScheme,
    },
  ],
  [
    'orientation',
    {
      values: new Set(['portrait', 'landscape']),
      readValue: (environment) =>
        environment.componentHeight >= environment.componentWidth
          ? 'portrait'
          : 'landscape',
    },
  ],
]);
