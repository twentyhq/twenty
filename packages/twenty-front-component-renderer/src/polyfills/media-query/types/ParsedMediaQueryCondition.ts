import { type MediaQueryComparison } from '@/polyfills/media-query/types/MediaQueryComparison';

export type ParsedMediaQueryCondition =
  | {
      kind: 'numeric';
      source: 'viewportWidth' | 'viewportHeight' | 'devicePixelRatio';
      comparison: MediaQueryComparison;
      value: number;
    }
  | {
      kind: 'color-scheme';
      value: 'light' | 'dark' | 'no-preference';
    };
