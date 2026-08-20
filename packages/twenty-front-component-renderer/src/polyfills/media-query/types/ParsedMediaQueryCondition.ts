import { type MediaQueryComparison } from '@/polyfills/media-query/types/MediaQueryComparison';
import { type MediaQueryOrientation } from '@/polyfills/media-query/types/MediaQueryOrientation';

export type ParsedMediaQueryCondition =
  | {
      kind: 'numeric';
      source: 'componentWidth' | 'componentHeight' | 'devicePixelRatio';
      comparison: MediaQueryComparison;
      value: number;
    }
  | {
      kind: 'color-scheme';
      value: 'light' | 'dark' | 'no-preference';
    }
  | {
      kind: 'orientation';
      value: MediaQueryOrientation;
    };
